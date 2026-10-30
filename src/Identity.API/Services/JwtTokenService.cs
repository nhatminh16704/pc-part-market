#nullable enable

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using eShop.Identity.API.Features.Auth;
using Microsoft.IdentityModel.Tokens;

namespace eShop.Identity.API.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly RsaKeyManager _rsaKeyManager;
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public JwtTokenService(
        RsaKeyManager rsaKeyManager,
        IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor)
    {
        _rsaKeyManager = rsaKeyManager;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
    }

    public Task<AuthResponse> CreateTokenResponseAsync(
        ApplicationUser user,
        IEnumerable<string> roles,
        string? issuer = null)
    {
        var primaryRole = roles.FirstOrDefault() ?? "Customer";
        var status = user.Status ?? UserStatus.Active;
        var tokenIssuer = GetIssuer(issuer);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new("preferred_username", user.UserName ?? user.Email ?? ""),
            new("status", status),
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

        var lifetimeSeconds = (int)TimeSpan.FromDays(7).TotalSeconds;
        var now = DateTime.UtcNow;

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = tokenIssuer,
            Audience = "basket", // Primary audience
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
        var tokenString = tokenHandler.WriteToken(token);

        var userDto = new UserDto(
            Id: user.Id,
            Email: user.Email ?? "",
            UserName: user.UserName,
            PhoneNumber: user.PhoneNumber,
            Status: status,
            Role: primaryRole
        );

        return Task.FromResult(new AuthResponse(tokenString, userDto, lifetimeSeconds));
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
