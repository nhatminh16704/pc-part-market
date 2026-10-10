using MassTransit;
using eShop.EventBus.Abstractions;
using eShop.EventBus.Events;

namespace eShop.EventBus;

public class MassTransitEventBus(IPublishEndpoint publishEndpoint) : IEventBus
{
    public Task PublishAsync(IntegrationEvent @event)
    {
        return publishEndpoint.Publish(@event, @event.GetType());
    }
}
