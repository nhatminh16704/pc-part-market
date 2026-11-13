using eShop.Customer.API.Model;

namespace eShop.Customer.API.Features.Addresses;

public record CustomerAddressDto(
    Guid Id,
    string ReceiverName,
    string ReceiverPhone,
    string Province,
    string District,
    string Ward,
    string StreetAddress,
    string? PostalCode,
    bool IsDefault,
    string? Label,
    DateTime CreatedAt,
    DateTime? UpdatedAt
)
{
    public static CustomerAddressDto FromEntity(CustomerAddress a) => new(
        a.Id,
        a.ReceiverName,
        a.ReceiverPhone,
        a.Province,
        a.District,
        a.Ward,
        a.StreetAddress,
        a.PostalCode,
        a.IsDefault,
        a.Label,
        a.CreatedAt,
        a.UpdatedAt
    );
}
