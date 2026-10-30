#nullable enable

namespace eShop.Identity.API.Services;

public interface IJwtTokenService
{
    Task<AuthResponse> CreateTokenResponseAsync(ApplicationUser user, IEnumerable<string> roles, string? issuer = null);
}
