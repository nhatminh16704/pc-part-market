using MassTransit;
using eShop.EventBus.Events;

namespace eShop.EventBus.Abstractions;

public class IntegrationEventHandlerConsumerAdapter<T, TH>(TH handler) : IConsumer<T>
    where T : IntegrationEvent
    where TH : IIntegrationEventHandler<T>
{
    public Task Consume(ConsumeContext<T> context) => handler.Handle(context.Message);
}
