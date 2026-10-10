namespace eShop.EventBus.Events;

public record ProductPriceChangedIntegrationEvent(
    int ProductId,
    decimal NewPrice,
    decimal OldPrice) : IntegrationEvent;
