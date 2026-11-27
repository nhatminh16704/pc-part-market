namespace eShop.Ordering.API.Application.DomainEventHandlers;

public partial class OrderCancelledDomainEventHandler
    : INotificationHandler<OrderCancelledDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger _logger;
    private readonly IOrderingIntegrationEventService _orderingIntegrationEventService;

    public OrderCancelledDomainEventHandler(
        IOrderRepository orderRepository,
        ILogger<OrderCancelledDomainEventHandler> logger,
        IOrderingIntegrationEventService orderingIntegrationEventService)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _orderingIntegrationEventService = orderingIntegrationEventService;
    }

    public async Task Handle(OrderCancelledDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        OrderingApiTrace.LogOrderStatusUpdated(_logger, domainEvent.Order.Id, OrderStatus.Cancelled);

        var order = await _orderRepository.GetAsync(domainEvent.Order.Id);
        if (order is null) return;

        var integrationEvent = new OrderStatusChangedToCancelledIntegrationEvent(
            order.Id,
            order.OrderStatus,
            order.Address.ReceiverName,
            order.CustomerId.ToString());

        await _orderingIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}
