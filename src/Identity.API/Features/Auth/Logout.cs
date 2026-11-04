#nullable enable

using eShop.Identity.API.Services;

namespace eShop.Identity.API.Features.Auth;

public static class LogoutEndpoint
{
    public static RouteHandlerBuilder MapLogout(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPost("/logout", Handle)
            .WithName("Logout")
            .WithSummary("User logout")
            .WithDescription("Revokes the provided Refresh Token.")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status204NoContent);
    }

    public static async Task<IResult> Handle(
        [FromBody] LogoutRequest? request,
        [FromServices] IJwtTokenService tokenService,
        HttpContext context)
    {
        await tokenService.RevokeRefreshTokenAsync(request?.RefreshToken, context);

        return Results.Ok(new { message = "Đăng xuất thành công." });
    }
}

