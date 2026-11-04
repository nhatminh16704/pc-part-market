#nullable enable

using eShop.Identity.API.Services;

namespace eShop.Identity.API.Features.Auth;

public static class RefreshTokenEndpoint
{
    public static RouteHandlerBuilder MapRefreshToken(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPost("/refresh-token", Handle)
            .WithName("RefreshToken")
            .WithSummary("Refresh Access Token")
            .WithDescription("Uses a valid Refresh Token to issue a new Access Token and rotate the Refresh Token.")
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    public static async Task<IResult> Handle(
        [FromBody] RefreshTokenRequest? request,
        [FromServices] IJwtTokenService tokenService,
        HttpContext context,
        ILogger<AuthResponse> logger)
    {
        var authResponse = await tokenService.RefreshTokenAsync(request?.RefreshToken, context);
        if (authResponse == null)
        {
            logger.LogWarning("Refresh token validation failed or token is expired/revoked.");
            return Results.Problem("Refresh token không hợp lệ hoặc đã hết hạn.", statusCode: StatusCodes.Status401Unauthorized);
        }

        return Results.Ok(authResponse);
    }
}

