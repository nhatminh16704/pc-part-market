#nullable enable

using Duende.IdentityModel;
using Duende.IdentityServer;

namespace eShop.Identity.API.Features.Auth;

public record UserDto(
    string Id,
    string Email,
    string Name,
    string LastName,
    string? PhoneNumber,
    string? Role
);

public record AuthResponse(
    string Token,
    UserDto User,
    long ExpiresIn
);

public static class TokenHelper
{
    public static async Task<AuthResponse> CreateTokenResponseAsync(
        ApplicationUser user,
        IEnumerable<string> roles,
        IdentityServerTools identityServerTools)
    {
        var primaryRole = roles.FirstOrDefault() ?? "Customer";

        var claims = new List<Claim>
        {
            new(JwtClaimTypes.Subject, user.Id),
            new(JwtClaimTypes.Name, $"{user.Name} {user.LastName}".Trim()),
            new(JwtClaimTypes.GivenName, user.Name ?? ""),
            new(JwtClaimTypes.FamilyName, user.LastName ?? ""),
            new(JwtClaimTypes.PreferredUserName, user.UserName ?? user.Email ?? ""),
            new(JwtClaimTypes.Email, user.Email ?? ""),
            new(JwtClaimTypes.Role, primaryRole),
            new("role", primaryRole),
            new(JwtClaimTypes.Audience, "basket"),
            new(JwtClaimTypes.Audience, "orders"),
            new(JwtClaimTypes.Audience, "webhooks")
        };

        foreach (var role in roles)
        {
            if (role != primaryRole)
            {
                claims.Add(new(JwtClaimTypes.Role, role));
            }
        }

        var lifetimeSeconds = (int)TimeSpan.FromDays(7).TotalSeconds;
        var token = await identityServerTools.IssueJwtAsync(lifetimeSeconds, claims);

        var userDto = new UserDto(
            Id: user.Id,
            Email: user.Email ?? "",
            Name: $"{user.Name} {user.LastName}".Trim(),
            LastName: user.LastName ?? "",
            PhoneNumber: user.PhoneNumber,
            Role: primaryRole
        );

        return new AuthResponse(token, userDto, lifetimeSeconds);
    }
}
