namespace eShop.EventBus.Events;

public record OrderPaymentFailedIntegrationEvent(int OrderId) : IntegrationEvent;
