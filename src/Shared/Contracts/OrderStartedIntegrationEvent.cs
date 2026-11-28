namespace eShop.Contracts;

public record OrderStartedIntegrationEvent(
    string UserId,
    IReadOnlyCollection<Guid>? VariantIds = null) : IntegrationEvent;
