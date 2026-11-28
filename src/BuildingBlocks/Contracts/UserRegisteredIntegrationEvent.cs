namespace eShop.Contracts;

public record UserRegisteredIntegrationEvent(
    Guid UserId,
    string Email,
    string? FirstName = null,
    string? LastName = null,
    string? PhoneNumber = null,
    string? AvatarUrl = null
) : IntegrationEvent;
