namespace eShop.Contracts;

public record ConfirmedOrderStockItem(Guid VariantId, bool HasStock);

public record OrderStockRejectedIntegrationEvent(
    int OrderId,
    List<ConfirmedOrderStockItem> OrderStockItems) : IntegrationEvent;
