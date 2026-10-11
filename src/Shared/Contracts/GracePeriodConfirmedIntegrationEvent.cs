namespace eShop.Contracts;

public record GracePeriodConfirmedIntegrationEvent(int OrderId) : IntegrationEvent;
