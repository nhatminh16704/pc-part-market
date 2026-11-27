#nullable enable

using eShop.Ordering.Domain.SeedWork;

namespace eShop.Ordering.Domain.AggregatesModel.OrderAggregate;

public class Address : ValueObject
{
    public string ReceiverName { get; private set; } = string.Empty;
    public string ReceiverPhone { get; private set; } = string.Empty;
    public string Province { get; private set; } = string.Empty;
    public string District { get; private set; } = string.Empty;
    public string Ward { get; private set; } = string.Empty;
    public string StreetAddress { get; private set; } = string.Empty;
    public string? PostalCode { get; private set; }

    public Address() { }

    public Address(
        string receiverName,
        string receiverPhone,
        string province,
        string district,
        string ward,
        string streetAddress,
        string? postalCode = null)
    {
        ReceiverName = receiverName;
        ReceiverPhone = receiverPhone;
        Province = province;
        District = district;
        Ward = ward;
        StreetAddress = streetAddress;
        PostalCode = postalCode;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return ReceiverName;
        yield return ReceiverPhone;
        yield return Province;
        yield return District;
        yield return Ward;
        yield return StreetAddress;
        yield return PostalCode ?? string.Empty;
    }
}
