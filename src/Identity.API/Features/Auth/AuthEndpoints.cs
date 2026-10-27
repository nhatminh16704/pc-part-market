#nullable enable

namespace eShop.Identity.API.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Authentication");

        group.MapPost("/login", LoginHandler.Handle)
            .WithName("Login")
            .WithSummary("User login")
            .WithDescription("Authenticates user by email or username and issues a signed JWT token.")
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapPost("/register", RegisterHandler.Handle)
            .WithName("Register")
            .WithSummary("User registration")
            .WithDescription("Registers a new customer account and returns a signed JWT token.")
            .Produces<AuthResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);

        group.MapGet("/me", GetCurrentUserHandler.Handle)
            .WithName("GetCurrentUser")
            .WithSummary("Get current user profile")
            .WithDescription("Retrieves the authenticated user profile based on Bearer token.")
            .Produces<UserDto>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound);

        return app;
    }
}
