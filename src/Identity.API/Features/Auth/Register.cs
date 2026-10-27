#nullable enable

using Duende.IdentityServer;

namespace eShop.Identity.API.Features.Auth;

public record RegisterRequest(
    string Email,
    string Password,
    string Name,
    string LastName,
    string? PhoneNumber = null,
    string? Street = null,
    string? City = null,
    string? State = null,
    string? Country = null,
    string? ZipCode = null
);

public static class RegisterEndpoint
{
    public static RouteHandlerBuilder MapRegister(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPost("/register", Handle)
            .WithName("Register")
            .WithSummary("User registration")
            .WithDescription("Registers a new customer account and returns a signed JWT token.")
            .Produces<AuthResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    public static async Task<IResult> Handle(
        [FromBody] RegisterRequest request,
        UserManager<ApplicationUser> userManager,
        [FromServices] IdentityServerTools identityServerTools,
        ILogger<AuthResponse> logger)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.Problem("Email và mật khẩu không được để trống.", statusCode: StatusCodes.Status400BadRequest);
        }

        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Results.Problem("Email đã được đăng ký trong hệ thống.", statusCode: StatusCodes.Status409Conflict);
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            Name = request.Name ?? "Khách hàng",
            LastName = request.LastName ?? "",
            PhoneNumber = request.PhoneNumber ?? "",
            Street = request.Street ?? "N/A",
            City = request.City ?? "Hà Nội",
            State = request.State ?? "Hà Nội",
            Country = request.Country ?? "Vietnam",
            ZipCode = request.ZipCode ?? "100000",
            CardHolderName = $"{request.Name} {request.LastName}".Trim(),
            CardNumber = "XXXXXXXXXXXX0000",
            CardType = 1,
            Expiration = "12/28",
            SecurityNumber = "000"
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Results.Problem($"Đăng ký không thành công: {errors}", statusCode: StatusCodes.Status400BadRequest);
        }

        var roles = await userManager.GetRolesAsync(user);
        var authResponse = await TokenHelper.CreateTokenResponseAsync(user, roles, identityServerTools);

        return Results.Created($"/api/auth/me", authResponse);
    }
}
