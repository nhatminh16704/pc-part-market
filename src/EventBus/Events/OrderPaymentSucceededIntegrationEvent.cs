namespace eShop.EventBus.Events;

public record OrderPaymentSucceededIntegrationEvent(int OrderId) : IntegrationEvent;
