using System.Security.Claims;

namespace eShop.Customer.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetCustomerId(this ClaimsPrincipal principal)
    {
        var raw = principal.FindFirst("sub")?.Value
            ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(raw, out var id) ? id : null;
    }

    public static string GetEmail(this ClaimsPrincipal principal)
    {
        return principal.FindFirst("email")?.Value
            ?? principal.FindFirst(ClaimTypes.Email)?.Value
            ?? string.Empty;
    }
}
