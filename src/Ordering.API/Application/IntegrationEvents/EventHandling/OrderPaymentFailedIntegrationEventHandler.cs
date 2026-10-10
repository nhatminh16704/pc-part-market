using MassTransit;
using eShop.Contracts;

namespace eShop.Ordering.API.Application.IntegrationEvents.EventHandling;

public class OrderPaymentFailedIntegrationEventHandler(
    IMediator mediator,
    ILogger<OrderPaymentFailedIntegrationEventHandler> logger) :
    IConsumer<OrderPaymentFailedIntegrationEvent>
{
    public async Task Consume(ConsumeContext<OrderPaymentFailedIntegrationEvent> context)
    {
        var @event = context.Message;
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

        var command = new CancelOrderCommand(@event.OrderId);

        logger.LogInformation(
            "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
            command.GetGenericTypeName(),
            nameof(command.OrderNumber),
            command.OrderNumber,
            command);

        await mediator.Send(command);
    }
}
