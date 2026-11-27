#nullable enable

namespace eShop.Ordering.API.Application.Commands;

using eShop.Ordering.API.Application.Models;
using eShop.Ordering.API.Extensions;

[DataContract]
public class CreateOrderCommand : IRequest<bool>
{
    [DataMember]
    private readonly List<OrderItemDTO> _orderItems;

    [DataMember]
    public Guid CustomerId { get; private set; }

    [DataMember]
    public string ReceiverName { get; private set; } = string.Empty;

    [DataMember]
    public string ReceiverPhone { get; private set; } = string.Empty;

    [DataMember]
    public string Province { get; private set; } = string.Empty;

    [DataMember]
    public string District { get; private set; } = string.Empty;

    [DataMember]
    public string Ward { get; private set; } = string.Empty;

    [DataMember]
    public string StreetAddress { get; private set; } = string.Empty;

    [DataMember]
    public string? PostalCode { get; private set; }

    [DataMember]
    public PaymentMethod PaymentMethod { get; private set; }

    [DataMember]
    public string? Description { get; private set; }

    [DataMember]
    public IEnumerable<OrderItemDTO> OrderItems => _orderItems;

    public CreateOrderCommand()
    {
        _orderItems = new List<OrderItemDTO>();
    }

    public CreateOrderCommand(
        List<BasketItem> basketItems,
        Guid customerId,
        string receiverName,
        string receiverPhone,
        string province,
        string district,
        string ward,
        string streetAddress,
        string? postalCode,
        PaymentMethod paymentMethod,
        string? description = null)
    {
        _orderItems = basketItems.ToOrderItemsDTO().ToList();
        CustomerId = customerId;
        ReceiverName = receiverName;
        ReceiverPhone = receiverPhone;
        Province = province;
        District = district;
        Ward = ward;
        StreetAddress = streetAddress;
        PostalCode = postalCode;
        PaymentMethod = paymentMethod;
        Description = description;
    }
}
