namespace eShop.EventBus.Events;

public record OrderStatusChangedToPaidIntegrationEvent(
    int OrderId,
    string? OrderStatus,
    string? BuyerName,
    string? BuyerIdentityGuid,
    IEnumerable<OrderStockItem> OrderStockItems) : IntegrationEvent
{
    public OrderStatusChangedToPaidIntegrationEvent(int orderId, IEnumerable<OrderStockItem> orderStockItems)
        : this(orderId, null, null, null, orderStockItems) { }

    public OrderStatusChangedToPaidIntegrationEvent(int orderId, object orderStatus, string buyerName, string buyerIdentityGuid, IEnumerable<OrderStockItem> orderStockItems)
        : this(orderId, orderStatus?.ToString(), buyerName, buyerIdentityGuid, orderStockItems) { }
}
