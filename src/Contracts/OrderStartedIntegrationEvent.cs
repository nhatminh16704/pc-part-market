namespace eShop.Contracts;

public record OrderStartedIntegrationEvent(string UserId) : IntegrationEvent;
