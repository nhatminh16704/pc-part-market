namespace eShop.EventBus.Events;

public record OrderStatusChangedToShippedIntegrationEvent(
    int OrderId,
    string? OrderStatus = null,
    string? BuyerName = null,
    string? BuyerIdentityGuid = null) : IntegrationEvent
{
    public OrderStatusChangedToShippedIntegrationEvent(int orderId, object orderStatus, string buyerName, string buyerIdentityGuid)
        : this(orderId, orderStatus?.ToString(), buyerName, buyerIdentityGuid) { }
}
