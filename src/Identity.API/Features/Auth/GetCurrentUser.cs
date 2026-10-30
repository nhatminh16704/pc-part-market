#nullable enable

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace eShop.Identity.API.Features.Auth;

public static class GetCurrentUserEndpoint
{
    public static RouteHandlerBuilder MapGetCurrentUser(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapGet("/me", Handle)
            .WithName("GetCurrentUser")
            .WithSummary("Get current user profile")
            .WithDescription("Retrieves the authenticated user profile based on Bearer token.")
            .Produces<UserDto>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    public static async Task<IResult> Handle(
        HttpContext context,
        UserManager<ApplicationUser> userManager)
    {
        // Extract userId from ClaimsPrincipal or Bearer token
        string? userId = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                         ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? context.User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            var authHeader = context.Request.Headers.Authorization.ToString();
            if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var tokenStr = authHeader["Bearer ".Length..].Trim();
                var handler = new JwtSecurityTokenHandler();
                if (handler.CanReadToken(tokenStr))
                {
                    var jwt = handler.ReadJwtToken(tokenStr);
                    userId = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub || c.Type == "sub" || c.Type == ClaimTypes.NameIdentifier)?.Value;
                }
            }
        }

        if (string.IsNullOrEmpty(userId))
        {
            return Results.Problem("Chưa xác thực người dùng.", statusCode: StatusCodes.Status401Unauthorized);
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Results.Problem("Không tìm thấy thông tin tài khoản.", statusCode: StatusCodes.Status404NotFound);
        }

        var roles = await userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Customer";

        var userDto = new UserDto(
            Id: user.Id,
            Email: user.Email ?? "",
            UserName: user.UserName,
            PhoneNumber: user.PhoneNumber,
            Status: user.Status ?? UserStatus.Active,
            Role: primaryRole
        );

        return Results.Ok(userDto);
    }
}
