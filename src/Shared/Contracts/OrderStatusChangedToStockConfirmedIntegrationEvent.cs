namespace eShop.Contracts;

public record OrderStatusChangedToStockConfirmedIntegrationEvent(
    int OrderId,
    string? OrderStatus = null,
    string? BuyerName = null,
    string? BuyerIdentityGuid = null) : IntegrationEvent
{
    public OrderStatusChangedToStockConfirmedIntegrationEvent(int orderId, object orderStatus, string buyerName, string buyerIdentityGuid)
        : this(orderId, orderStatus?.ToString(), buyerName, buyerIdentityGuid) { }
}
