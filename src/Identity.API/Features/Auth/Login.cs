#nullable enable

using eShop.Identity.API.Services;

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
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    public static async Task<IResult> Handle(
        [FromBody] LoginRequest request,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        [FromServices] IJwtTokenService tokenService,
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

        // Check account status: ACTIVE, LOCKED, BANNED
        if (string.Equals(user.Status, UserStatus.Locked, StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning("Login rejected: Account is LOCKED for {Email}", request.Email);
            return Results.Problem("Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.", statusCode: StatusCodes.Status403Forbidden);
        }

        if (string.Equals(user.Status, UserStatus.Banned, StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning("Login rejected: Account is BANNED for {Email}", request.Email);
            return Results.Problem("Tài khoản của bạn đã bị cấm khỏi hệ thống.", statusCode: StatusCodes.Status403Forbidden);
        }

        if (!string.Equals(user.Status, UserStatus.Active, StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning("Login rejected: Inactive account status ({Status}) for {Email}", user.Status, request.Email);
            return Results.Problem("Tài khoản hiện không ở trạng thái hoạt động.", statusCode: StatusCodes.Status403Forbidden);
        }

        var checkPassword = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!checkPassword.Succeeded)
        {
            logger.LogWarning("Login failed: Invalid password for {Email}", request.Email);
            return Results.Problem("Tài khoản hoặc mật khẩu không chính xác.", statusCode: StatusCodes.Status401Unauthorized);
        }

        var roles = await userManager.GetRolesAsync(user);
        var authResponse = await tokenService.CreateTokenResponseAsync(user, roles);

        return Results.Ok(authResponse);
    }
}
