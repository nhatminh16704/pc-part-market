#nullable enable

using Google.Apis.Auth;
using eShop.Identity.API.Models;
using eShop.Identity.API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace eShop.Identity.API.Features.Auth;

public static class GoogleLoginEndpoint
{
    public static RouteHandlerBuilder MapGoogleLogin(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPost("/google", Handle)
            .WithName("GoogleLogin")
            .WithSummary("Google OAuth login")
            .WithDescription("Authenticates user via Google ID Token, registers user if not exist, and returns JWT + HttpOnly Refresh Cookie.")
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status500InternalServerError);
    }

    public static async Task<IResult> Handle(
        [FromBody] GoogleLoginRequest request,
        UserManager<ApplicationUser> userManager,
        [FromServices] IJwtTokenService tokenService,
        IConfiguration configuration,
        HttpContext context,
        ILogger<AuthResponse> logger)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return Results.Problem("IdToken không được để trống.", statusCode: StatusCodes.Status400BadRequest);
        }

        var clientId = configuration["Authentication:Google:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
        {
            logger.LogError("Google ClientId is not configured in Identity.API");
            return Results.Problem("Cấu hình đăng nhập Google chưa sẵn sàng trên hệ thống.", statusCode: StatusCodes.Status500InternalServerError);
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [clientId]
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
        }
        catch (InvalidJwtException ex)
        {
            logger.LogWarning(ex, "Google token validation failed: {Message}", ex.Message);
            return Results.Problem("Xác thực tài khoản Google không hợp lệ hoặc token đã hết hạn.", statusCode: StatusCodes.Status401Unauthorized);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error validating Google token");
            return Results.Problem("Không thể xác thực với Google. Vui lòng thử lại sau.", statusCode: StatusCodes.Status500InternalServerError);
        }

        if (string.IsNullOrWhiteSpace(payload.Email))
        {
            return Results.Problem("Tài khoản Google không cung cấp thông tin email.", statusCode: StatusCodes.Status400BadRequest);
        }

        var user = await userManager.FindByEmailAsync(payload.Email);
        if (user == null)
        {
            // Tạo mới user từ tài khoản Google
            user = new ApplicationUser
            {
                Id = Guid.NewGuid().ToString(),
                UserName = payload.Email,
                Email = payload.Email,
                EmailConfirmed = true,
                Status = UserStatus.Active,
                UserType = UserTypes.Customer
            };

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                logger.LogError("Failed to create user from Google login: {Errors}", errors);
                return Results.Problem($"Đăng ký tài khoản không thành công: {errors}", statusCode: StatusCodes.Status400BadRequest);
            }

            await userManager.AddLoginAsync(user, new UserLoginInfo("Google", payload.Subject, "Google"));
            logger.LogInformation("New user registered via Google: {Email}", payload.Email);
        }
        else
        {
            // Kiểm tra trạng thái tài khoản
            if (string.Equals(user.Status, UserStatus.Locked, StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("Google login rejected: Account is LOCKED for {Email}", user.Email);
                return Results.Problem("Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.", statusCode: StatusCodes.Status403Forbidden);
            }

            if (string.Equals(user.Status, UserStatus.Banned, StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("Google login rejected: Account is BANNED for {Email}", user.Email);
                return Results.Problem("Tài khoản của bạn đã bị cấm khỏi hệ thống.", statusCode: StatusCodes.Status403Forbidden);
            }

            if (!string.Equals(user.Status, UserStatus.Active, StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("Google login rejected: Inactive account status ({Status}) for {Email}", user.Status, user.Email);
                return Results.Problem("Tài khoản hiện không ở trạng thái hoạt động.", statusCode: StatusCodes.Status403Forbidden);
            }

            var logins = await userManager.GetLoginsAsync(user);
            if (!logins.Any(l => l.LoginProvider == "Google"))
            {
                await userManager.AddLoginAsync(user, new UserLoginInfo("Google", payload.Subject, "Google"));
                logger.LogInformation("Linked Google login for existing user: {Email}", user.Email);
            }
        }

        var roles = await userManager.GetRolesAsync(user);
        var authResponse = await tokenService.CreateTokenResponseAsync(user, roles, context);

        return Results.Ok(authResponse);
    }
}
