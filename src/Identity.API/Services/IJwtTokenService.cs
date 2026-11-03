#nullable enable

namespace eShop.Identity.API.Services;

public interface IJwtTokenService
{
    Task<AuthResponse> CreateTokenResponseAsync(ApplicationUser user, IEnumerable<string> roles, string? issuer = null);
    Task<AuthResponse?> RefreshTokenAsync(string rawRefreshToken, string? issuer = null);
    Task<bool> RevokeRefreshTokenAsync(string rawRefreshToken);
}
