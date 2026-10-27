#nullable enable

using Duende.IdentityModel;
using Duende.IdentityServer;
using Microsoft.AspNetCore.Http.HttpResults;

namespace eShop.Identity.API.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Authentication");

        group.MapPost("/login", LoginAsync)
            .WithName("Login")
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapPost("/register", RegisterAsync)
            .WithName("Register")
            .Produces<AuthResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);

        group.MapGet("/me", GetCurrentUserAsync)
            .WithName("GetCurrentUser")
            .Produces<UserDto>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        return app;
    }

    public static async Task<IResult> LoginAsync(
        [FromBody] LoginRequest request,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IdentityServerTools identityServerTools,
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
        var primaryRole = roles.FirstOrDefault() ?? "Customer";

        var claims = new List<Claim>
        {
            new(JwtClaimTypes.Subject, user.Id),
            new(JwtClaimTypes.Name, $"{user.Name} {user.LastName}".Trim()),
            new(JwtClaimTypes.GivenName, user.Name ?? ""),
            new(JwtClaimTypes.FamilyName, user.LastName ?? ""),
            new(JwtClaimTypes.PreferredUserName, user.UserName ?? user.Email ?? ""),
            new(JwtClaimTypes.Email, user.Email ?? ""),
            new(JwtClaimTypes.Role, primaryRole),
            new("role", primaryRole),
            new(JwtClaimTypes.Audience, "basket"),
            new(JwtClaimTypes.Audience, "orders"),
            new(JwtClaimTypes.Audience, "webhooks")
        };

        foreach (var role in roles)
        {
            if (role != primaryRole)
            {
                claims.Add(new(JwtClaimTypes.Role, role));
            }
        }

        var lifetimeSeconds = (int)TimeSpan.FromDays(7).TotalSeconds;
        var token = await identityServerTools.IssueJwtAsync(lifetimeSeconds, claims);

        var userDto = new UserDto(
            Id: user.Id,
            Email: user.Email ?? "",
            Name: $"{user.Name} {user.LastName}".Trim(),
            LastName: user.LastName ?? "",
            PhoneNumber: user.PhoneNumber,
            Role: primaryRole,
            Street: user.Street,
            City: user.City,
            State: user.State,
            Country: user.Country,
            ZipCode: user.ZipCode
        );

        return Results.Ok(new AuthResponse(token, userDto, lifetimeSeconds));
    }

    public static async Task<IResult> RegisterAsync(
        [FromBody] RegisterRequest request,
        UserManager<ApplicationUser> userManager,
        IdentityServerTools identityServerTools,
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

        var claims = new List<Claim>
        {
            new(JwtClaimTypes.Subject, user.Id),
            new(JwtClaimTypes.Name, $"{user.Name} {user.LastName}".Trim()),
            new(JwtClaimTypes.GivenName, user.Name ?? ""),
            new(JwtClaimTypes.FamilyName, user.LastName ?? ""),
            new(JwtClaimTypes.PreferredUserName, user.UserName ?? user.Email ?? ""),
            new(JwtClaimTypes.Email, user.Email ?? ""),
            new(JwtClaimTypes.Role, "Customer"),
            new("role", "Customer"),
            new(JwtClaimTypes.Audience, "basket"),
            new(JwtClaimTypes.Audience, "orders"),
            new(JwtClaimTypes.Audience, "webhooks")
        };

        var lifetimeSeconds = (int)TimeSpan.FromDays(7).TotalSeconds;
        var token = await identityServerTools.IssueJwtAsync(lifetimeSeconds, claims);

        var userDto = new UserDto(
            Id: user.Id,
            Email: user.Email ?? "",
            Name: $"{user.Name} {user.LastName}".Trim(),
            LastName: user.LastName ?? "",
            PhoneNumber: user.PhoneNumber,
            Role: "Customer",
            Street: user.Street,
            City: user.City,
            State: user.State,
            Country: user.Country,
            ZipCode: user.ZipCode
        );

        return Results.Created($"/api/auth/me", new AuthResponse(token, userDto, lifetimeSeconds));
    }

    public static async Task<IResult> GetCurrentUserAsync(
        HttpContext context,
        UserManager<ApplicationUser> userManager)
    {
        // Extract userId from ClaimsPrincipal (if authenticated via cookie/bearer) or Bearer token
        string? userId = context.User.FindFirst(JwtClaimTypes.Subject)?.Value 
                         ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

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
                    userId = jwt.Claims.FirstOrDefault(c => c.Type == JwtClaimTypes.Subject || c.Type == "sub")?.Value;
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
            Name: $"{user.Name} {user.LastName}".Trim(),
            LastName: user.LastName ?? "",
            PhoneNumber: user.PhoneNumber,
            Role: primaryRole,
            Street: user.Street,
            City: user.City,
            State: user.State,
            Country: user.Country,
            ZipCode: user.ZipCode
        );

        return Results.Ok(userDto);
    }
}
