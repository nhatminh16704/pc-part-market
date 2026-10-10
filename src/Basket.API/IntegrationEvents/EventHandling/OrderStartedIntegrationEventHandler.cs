using MassTransit;
using eShop.Basket.API.Repositories;
using eShop.Contracts;

namespace eShop.Basket.API.IntegrationEvents.EventHandling;

public class OrderStartedIntegrationEventHandler(
    IBasketRepository repository,
    ILogger<OrderStartedIntegrationEventHandler> logger) : IConsumer<OrderStartedIntegrationEvent>
{
    public async Task Consume(ConsumeContext<OrderStartedIntegrationEvent> context)
    {
        var @event = context.Message;
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

        await repository.DeleteBasketAsync(@event.UserId);
    }
}
