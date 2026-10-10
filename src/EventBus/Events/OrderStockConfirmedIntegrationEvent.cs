namespace eShop.EventBus.Events;

public record OrderStockConfirmedIntegrationEvent(int OrderId) : IntegrationEvent;
