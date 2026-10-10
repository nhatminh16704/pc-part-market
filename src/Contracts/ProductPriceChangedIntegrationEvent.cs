namespace eShop.Contracts;

public record ProductPriceChangedIntegrationEvent(
    int ProductId,
    decimal NewPrice,
    decimal OldPrice) : IntegrationEvent;
