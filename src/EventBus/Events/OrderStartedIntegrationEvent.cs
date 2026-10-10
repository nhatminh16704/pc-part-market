namespace eShop.EventBus.Events;

public record OrderStartedIntegrationEvent(string UserId) : IntegrationEvent;
