#nullable enable

namespace eShop.Identity.API.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth")
            .WithTags("Authentication");

        group.MapLogin();
        group.MapRegister();
        group.MapGetCurrentUser();
        group.MapRefreshToken();
        group.MapLogout();

        return app;
    }
}
