namespace eShop.Contracts;

public record OrderPaymentFailedIntegrationEvent(int OrderId) : IntegrationEvent;
