#nullable enable

namespace eShop.Identity.API.Features.Auth;

public record UserDto(
    string Id,
    string Email,
    string? UserName,
    string? PhoneNumber,
    string Status,
    string? Role
);

public record AuthResponse(
    string Token,
    UserDto User,
    long ExpiresIn
);
