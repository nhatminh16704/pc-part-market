#nullable enable

namespace eShop.Identity.API.Features.Auth;

public record LoginRequest(string Email, string Password);

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

public record UserDto(
    string Id,
    string Email,
    string Name,
    string LastName,
    string? PhoneNumber,
    string? Role,
    string? Street,
    string? City,
    string? State,
    string? Country,
    string? ZipCode
);

public record AuthResponse(
    string Token,
    UserDto User,
    long ExpiresIn
);
