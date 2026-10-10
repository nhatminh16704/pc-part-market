namespace eShop.Contracts;

public record OrderPaymentSucceededIntegrationEvent(int OrderId) : IntegrationEvent;
