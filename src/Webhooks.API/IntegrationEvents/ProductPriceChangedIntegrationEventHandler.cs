using MassTransit;
using eShop.EventBus.Events;

namespace Webhooks.API.IntegrationEvents;

public class ProductPriceChangedIntegrationEventHandler : IConsumer<ProductPriceChangedIntegrationEvent>
{
    public Task Consume(ConsumeContext<ProductPriceChangedIntegrationEvent> context)
    {
        return Task.CompletedTask;
    }
}
