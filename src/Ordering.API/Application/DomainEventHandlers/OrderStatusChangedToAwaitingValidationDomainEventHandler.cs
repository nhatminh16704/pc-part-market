namespace eShop.Ordering.API.Application.DomainEventHandlers;

public class OrderStatusChangedToAwaitingValidationDomainEventHandler
    : INotificationHandler<OrderStatusChangedToAwaitingValidationDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger _logger;
    private readonly IOrderingIntegrationEventService _orderingIntegrationEventService;

    public OrderStatusChangedToAwaitingValidationDomainEventHandler(
        IOrderRepository orderRepository,
        ILogger<OrderStatusChangedToAwaitingValidationDomainEventHandler> logger,
        IOrderingIntegrationEventService orderingIntegrationEventService)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _orderingIntegrationEventService = orderingIntegrationEventService;
    }

    public async Task Handle(OrderStatusChangedToAwaitingValidationDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        OrderingApiTrace.LogOrderStatusUpdated(_logger, domainEvent.OrderId, OrderStatus.AwaitingValidation);

        var order = await _orderRepository.GetAsync(domainEvent.OrderId);
        if (order is null) return;

        var orderStockList = domainEvent.OrderItems
            .Select(orderItem => new OrderStockItem(orderItem.ProductId, orderItem.VariantId, orderItem.Units));

        var integrationEvent = new OrderStatusChangedToAwaitingValidationIntegrationEvent(
            order.Id,
            order.OrderStatus,
            order.Address.ReceiverName,
            order.CustomerId.ToString(),
            orderStockList);

        await _orderingIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}
