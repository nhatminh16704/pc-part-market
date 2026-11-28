namespace eShop.Contracts;

public record OrderStockConfirmedIntegrationEvent(int OrderId) : IntegrationEvent;
