#nullable enable

namespace eShop.Identity.API.Features.Auth;

public record UserDto(
    string Id,
    string Email,
    string? UserName,
    string? PhoneNumber,
    string Status,
    string UserType,
    string? Role
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    long ExpiresIn
);

public record RefreshTokenRequest(
    string RefreshToken
);

public record LogoutRequest(
    string? RefreshToken
);
