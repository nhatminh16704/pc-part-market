#nullable enable

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using eShop.Identity.API.Data;
using eShop.Identity.API.Features.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace eShop.Identity.API.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly RsaKeyManager _rsaKeyManager;
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<JwtTokenService> _logger;

    public JwtTokenService(
        RsaKeyManager rsaKeyManager,
        IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor,
        IServiceProvider serviceProvider,
        ILogger<JwtTokenService> logger)
    {
        _rsaKeyManager = rsaKeyManager;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<AuthResponse> CreateTokenResponseAsync(
        ApplicationUser user,
        IEnumerable<string> roles,
        string? issuer = null)
    {
        var primaryRole = roles.FirstOrDefault() ?? "Customer";
        var status = user.Status ?? UserStatus.Active;
        var userType = user.UserType ?? UserTypes.Customer;
        var tokenIssuer = GetIssuer(issuer);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new("preferred_username", user.UserName ?? user.Email ?? ""),
            new("status", status),
            new("user_type", userType),
            new(ClaimTypes.Role, primaryRole),
            new("role", primaryRole),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new(JwtRegisteredClaimNames.Aud, "basket"),
            new(JwtRegisteredClaimNames.Aud, "orders"),
            new(JwtRegisteredClaimNames.Aud, "webhooks")
        };

        foreach (var role in roles)
        {
            if (role != primaryRole)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
                claims.Add(new Claim("role", role));
            }
        }

        var signingCredentials = new SigningCredentials(
            _rsaKeyManager.GetSigningKey(),
            SecurityAlgorithms.RsaSha256);

        // AccessToken hết hạn trong 1 giờ (3600s)
        var lifetimeSeconds = (int)TimeSpan.FromHours(1).TotalSeconds;
        var now = DateTime.UtcNow;

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = tokenIssuer,
            Audience = "basket",
            NotBefore = now,
            IssuedAt = now,
            Expires = now.AddSeconds(lifetimeSeconds),
            SigningCredentials = signingCredentials
        };

        var tokenHandler = new JwtSecurityTokenHandler
        {
            SetDefaultTimesOnTokenCreation = false
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var accessTokenString = tokenHandler.WriteToken(token);

        // Sinh Refresh Token (sống trong 7 ngày)
        var rawRefreshToken = GenerateSecureRawToken();
        var refreshTokenHash = HashToken(rawRefreshToken);

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshTokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            CreatedAt = DateTimeOffset.UtcNow
        };

        dbContext.RefreshTokens.Add(refreshTokenEntity);
        await dbContext.SaveChangesAsync();

        return new AuthResponse(accessTokenString, rawRefreshToken, lifetimeSeconds);
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string rawRefreshToken, string? issuer = null)
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            return null;
        }

        var incomingHash = HashToken(rawRefreshToken);

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var existingToken = await dbContext.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == incomingHash);

        if (existingToken == null)
        {
            _logger.LogWarning("Refresh token attempt with non-existing token hash");
            return null;
        }

        // PHÁT HIỆN TẤN CÔNG (Token Reuse Detection):
        // Nếu token này đã bị thu hồi (Revoked) trước đó mà vẫn bị đem ra dùng, có thể token đã bị lộ/đánh cắp!
        // Ta thu hồi toàn bộ Refresh Token của User này để bảo vệ tài khoản.
        if (existingToken.IsRevoked)
        {
            _logger.LogWarning("Revoked refresh token reuse detected for UserId: {UserId}! Revoking all user tokens.", existingToken.UserId);
            var userTokens = await dbContext.RefreshTokens
                .Where(t => t.UserId == existingToken.UserId && t.RevokedAt == null)
                .ToListAsync();

            foreach (var t in userTokens)
            {
                t.RevokedAt = DateTimeOffset.UtcNow;
            }
            await dbContext.SaveChangesAsync();
            return null;
        }

        if (existingToken.IsExpired)
        {
            _logger.LogInformation("Expired refresh token for UserId: {UserId}", existingToken.UserId);
            return null;
        }

        var user = existingToken.User;
        if (user == null || user.Status != UserStatus.Active)
        {
            _logger.LogWarning("User is null or inactive for refresh token UserId: {UserId}", existingToken.UserId);
            return null;
        }

        // Token Rotation: Thu hồi token cũ và liên kết tới token mới
        var newRawRefreshToken = GenerateSecureRawToken();
        var newRefreshTokenHash = HashToken(newRawRefreshToken);

        existingToken.RevokedAt = DateTimeOffset.UtcNow;
        existingToken.ReplacedByTokenHash = newRefreshTokenHash;

        var newRefreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = newRefreshTokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            CreatedAt = DateTimeOffset.UtcNow
        };

        dbContext.RefreshTokens.Add(newRefreshTokenEntity);
        await dbContext.SaveChangesAsync();

        // Cấp AccessToken mới
        var roles = await userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Customer";
        var tokenIssuer = GetIssuer(issuer);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new("preferred_username", user.UserName ?? user.Email ?? ""),
            new("status", user.Status ?? UserStatus.Active),
            new("user_type", user.UserType ?? UserTypes.Customer),
            new(ClaimTypes.Role, primaryRole),
            new("role", primaryRole),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new(JwtRegisteredClaimNames.Aud, "basket"),
            new(JwtRegisteredClaimNames.Aud, "orders"),
            new(JwtRegisteredClaimNames.Aud, "webhooks")
        };

        foreach (var role in roles)
        {
            if (role != primaryRole)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
                claims.Add(new Claim("role", role));
            }
        }

        var signingCredentials = new SigningCredentials(
            _rsaKeyManager.GetSigningKey(),
            SecurityAlgorithms.RsaSha256);

        var lifetimeSeconds = (int)TimeSpan.FromHours(1).TotalSeconds;
        var now = DateTime.UtcNow;

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = tokenIssuer,
            Audience = "basket",
            NotBefore = now,
            IssuedAt = now,
            Expires = now.AddSeconds(lifetimeSeconds),
            SigningCredentials = signingCredentials
        };

        var tokenHandler = new JwtSecurityTokenHandler
        {
            SetDefaultTimesOnTokenCreation = false
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var accessTokenString = tokenHandler.WriteToken(token);

        return new AuthResponse(accessTokenString, newRawRefreshToken, lifetimeSeconds);
    }

    public async Task<bool> RevokeRefreshTokenAsync(string rawRefreshToken)
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            return false;
        }

        var incomingHash = HashToken(rawRefreshToken);

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var tokenEntity = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == incomingHash && t.RevokedAt == null);

        if (tokenEntity == null)
        {
            return false;
        }

        tokenEntity.RevokedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync();
        return true;
    }

    private static string GenerateSecureRawToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    private static string HashToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private string GetIssuer(string? explicitIssuer)
    {
        if (!string.IsNullOrWhiteSpace(explicitIssuer))
            return explicitIssuer.TrimEnd('/');

        var configIssuer = _configuration["Identity:Url"] ?? _configuration["IdentityUrl"];
        if (!string.IsNullOrWhiteSpace(configIssuer))
            return configIssuer.TrimEnd('/');

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            return $"{httpContext.Request.Scheme}://{httpContext.Request.Host}".TrimEnd('/');
        }

        return "http://identity";
    }
}
