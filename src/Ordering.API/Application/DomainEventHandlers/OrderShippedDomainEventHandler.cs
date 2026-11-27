namespace eShop.Ordering.API.Application.DomainEventHandlers;

public class OrderShippedDomainEventHandler
    : INotificationHandler<OrderShippedDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderingIntegrationEventService _orderingIntegrationEventService;
    private readonly ILogger _logger;

    public OrderShippedDomainEventHandler(
        IOrderRepository orderRepository,
        ILogger<OrderShippedDomainEventHandler> logger,
        IOrderingIntegrationEventService orderingIntegrationEventService)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _orderingIntegrationEventService = orderingIntegrationEventService;
    }

    public async Task Handle(OrderShippedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        OrderingApiTrace.LogOrderStatusUpdated(_logger, domainEvent.Order.Id, OrderStatus.Shipped);

        var order = await _orderRepository.GetAsync(domainEvent.Order.Id);
        if (order is null) return;

        var integrationEvent = new OrderStatusChangedToShippedIntegrationEvent(
            order.Id,
            order.OrderStatus,
            order.Address.ReceiverName,
            order.CustomerId.ToString());

        await _orderingIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}
