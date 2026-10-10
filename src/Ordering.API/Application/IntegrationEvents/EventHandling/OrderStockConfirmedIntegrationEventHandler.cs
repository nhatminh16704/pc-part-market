using MassTransit;
using eShop.Contracts;

namespace eShop.Ordering.API.Application.IntegrationEvents.EventHandling;

public class OrderStockConfirmedIntegrationEventHandler(
    IMediator mediator,
    ILogger<OrderStockConfirmedIntegrationEventHandler> logger) :
    IConsumer<OrderStockConfirmedIntegrationEvent>
{
    public async Task Consume(ConsumeContext<OrderStockConfirmedIntegrationEvent> context)
    {
        var @event = context.Message;
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

        var command = new SetStockConfirmedOrderStatusCommand(@event.OrderId);

        logger.LogInformation(
            "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
            command.GetGenericTypeName(),
            nameof(command.OrderNumber),
            command.OrderNumber,
            command);

        await mediator.Send(command);
    }
}
