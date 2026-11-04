#nullable enable

namespace eShop.Identity.API.Services;

public interface IJwtTokenService
{
    Task<AuthResponse> CreateTokenResponseAsync(ApplicationUser user, IEnumerable<string> roles, HttpContext? httpContext = null, string? issuer = null);
    Task<AuthResponse?> RefreshTokenAsync(string? rawRefreshToken = null, HttpContext? httpContext = null, string? issuer = null);
    Task<bool> RevokeRefreshTokenAsync(string? rawRefreshToken = null, HttpContext? httpContext = null);
}
