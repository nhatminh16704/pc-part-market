using MassTransit;
using eShop.Contracts;

namespace Webhooks.API.IntegrationEvents;

public class ProductPriceChangedIntegrationEventHandler : IConsumer<ProductPriceChangedIntegrationEvent>
{
    public Task Consume(ConsumeContext<ProductPriceChangedIntegrationEvent> context)
    {
        return Task.CompletedTask;
    }
}
