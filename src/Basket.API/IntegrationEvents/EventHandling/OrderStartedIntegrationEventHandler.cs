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

        if (@event.VariantIds is null)
        {
            await repository.DeleteBasketAsync(@event.UserId);
            return;
        }

        if (@event.VariantIds.Count == 0)
        {
            return;
        }

        var basket = await repository.GetBasketAsync(@event.UserId);
        if (basket is null)
        {
            return;
        }

        var orderedSet = @event.VariantIds.ToHashSet();
        basket.Items.RemoveAll(item => orderedSet.Contains(item.VariantId));

        if (basket.Items.Count == 0)
        {
            await repository.DeleteBasketAsync(@event.UserId);
        }
        else
        {
            await repository.UpdateBasketAsync(basket);
        }
    }
}
