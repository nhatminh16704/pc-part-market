#nullable enable

using Duende.IdentityServer;

namespace eShop.Identity.API.Features.Auth;

public record LoginRequest(string Email, string Password);

public static class LoginEndpoint
{
    public static RouteHandlerBuilder MapLogin(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPost("/login", Handle)
            .WithName("Login")
            .WithSummary("User login")
            .WithDescription("Authenticates user by email or username and issues a signed JWT token.")
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    public static async Task<IResult> Handle(
        [FromBody] LoginRequest request,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        [FromServices] IdentityServerTools identityServerTools,
        ILogger<AuthResponse> logger)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.Problem("Email và mật khẩu không được để trống.", statusCode: StatusCodes.Status400BadRequest);
        }

        // Allow login by Email or UserName (e.g. alice, bob)
        var user = await userManager.FindByEmailAsync(request.Email) 
                   ?? await userManager.FindByNameAsync(request.Email);

        if (user == null)
        {
            logger.LogWarning("Login failed: User not found for {Email}", request.Email);
            return Results.Problem("Tài khoản hoặc mật khẩu không chính xác.", statusCode: StatusCodes.Status401Unauthorized);
        }

        var checkPassword = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!checkPassword.Succeeded)
        {
            logger.LogWarning("Login failed: Invalid password for {Email}", request.Email);
            return Results.Problem("Tài khoản hoặc mật khẩu không chính xác.", statusCode: StatusCodes.Status401Unauthorized);
        }

        var roles = await userManager.GetRolesAsync(user);
        var authResponse = await TokenHelper.CreateTokenResponseAsync(user, roles, identityServerTools);

        return Results.Ok(authResponse);
    }
}
