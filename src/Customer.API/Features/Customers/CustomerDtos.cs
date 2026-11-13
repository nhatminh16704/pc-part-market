namespace eShop.Customer.API.Features.Customers;

public record CustomerProfileDto(
    Guid Id,
    string Email,
    string? FirstName,
    string? LastName,
    string? PhoneNumber,
    string? AvatarUrl,
    string? Gender,
    DateOnly? DateOfBirth,
    DateTime CreatedAt,
    DateTime? UpdatedAt
)
{
    public static CustomerProfileDto FromEntity(Model.Customer c) => new(
        c.Id,
        c.Email,
        c.FirstName,
        c.LastName,
        c.PhoneNumber,
        c.AvatarUrl,
        c.Gender,
        c.DateOfBirth,
        c.CreatedAt,
        c.UpdatedAt
    );
}
