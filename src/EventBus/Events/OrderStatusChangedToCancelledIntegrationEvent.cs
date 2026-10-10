namespace eShop.EventBus.Events;

public record OrderStatusChangedToCancelledIntegrationEvent(
    int OrderId,
    string? OrderStatus = null,
    string? BuyerName = null,
    string? BuyerIdentityGuid = null) : IntegrationEvent
{
    public OrderStatusChangedToCancelledIntegrationEvent(int orderId, object orderStatus, string buyerName, string buyerIdentityGuid)
        : this(orderId, orderStatus?.ToString(), buyerName, buyerIdentityGuid) { }
}
