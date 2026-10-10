namespace eShop.Contracts;

public record OrderStatusChangedToSubmittedIntegrationEvent(
    int OrderId,
    string? OrderStatus = null,
    string? BuyerName = null,
    string? BuyerIdentityGuid = null) : IntegrationEvent
{
    public OrderStatusChangedToSubmittedIntegrationEvent(int orderId, object orderStatus, string buyerName, string buyerIdentityGuid)
        : this(orderId, orderStatus?.ToString(), buyerName, buyerIdentityGuid) { }
}
