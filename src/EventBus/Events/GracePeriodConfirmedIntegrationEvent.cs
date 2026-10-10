namespace eShop.EventBus.Events;

public record GracePeriodConfirmedIntegrationEvent(int OrderId) : IntegrationEvent;
