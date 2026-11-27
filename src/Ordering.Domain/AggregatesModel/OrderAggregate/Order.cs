#nullable enable

using System.ComponentModel.DataAnnotations;

namespace eShop.Ordering.Domain.AggregatesModel.OrderAggregate;

public class Order : Entity, IAggregateRoot
{
    public DateTime OrderDate { get; private set; }

    [Required]
    public Address Address { get; private set; } = null!;

    public Guid CustomerId { get; private set; }

    public PaymentMethod PaymentMethod { get; private set; }

    public PaymentStatus PaymentStatus { get; private set; }

    public OrderStatus OrderStatus { get; private set; }

    public string? Description { get; private set; }

#pragma warning disable CS0414
    private bool _isDraft;
#pragma warning restore CS0414

    private readonly List<OrderItem> _orderItems;

    public IReadOnlyCollection<OrderItem> OrderItems => _orderItems.AsReadOnly();

    public static Order NewDraft()
    {
        return new Order
        {
            _isDraft = true
        };
    }

    protected Order()
    {
        _orderItems = new List<OrderItem>();
        _isDraft = false;
    }

    public Order(Guid customerId, Address address, PaymentMethod paymentMethod, string? description = null) : this()
    {
        CustomerId = customerId != Guid.Empty ? customerId : throw new OrderingDomainException("CustomerId is required.");
        Address = address ?? throw new ArgumentNullException(nameof(address));
        PaymentMethod = paymentMethod;
        PaymentStatus = PaymentStatus.Unpaid;
        OrderStatus = OrderStatus.Submitted;
        OrderDate = DateTime.UtcNow;
        Description = description;

        AddDomainEvent(new OrderStartedDomainEvent(this, customerId));
    }

    public void AddOrderItem(
        Guid productId,
        Guid variantId,
        string sku,
        string productName,
        long unitPrice,
        long discount,
        string? pictureUrl,
        int units = 1)
    {
        var existingOrderForVariant = _orderItems.SingleOrDefault(o => o.VariantId == variantId);

        if (existingOrderForVariant != null)
        {
            if (discount > existingOrderForVariant.Discount)
            {
                existingOrderForVariant.SetNewDiscount(discount);
            }

            existingOrderForVariant.AddUnits(units);
        }
        else
        {
            var orderItem = new OrderItem(productId, variantId, sku, productName, unitPrice, discount, pictureUrl, units);
            _orderItems.Add(orderItem);
        }
    }

    public void SetAwaitingValidationStatus()
    {
        if (OrderStatus == OrderStatus.Submitted)
        {
            AddDomainEvent(new OrderStatusChangedToAwaitingValidationDomainEvent(Id, _orderItems));
            OrderStatus = OrderStatus.AwaitingValidation;
        }
    }

    public void SetStockConfirmedStatus()
    {
        if (OrderStatus == OrderStatus.AwaitingValidation)
        {
            AddDomainEvent(new OrderStatusChangedToStockConfirmedDomainEvent(Id));

            OrderStatus = OrderStatus.StockConfirmed;
            Description = "All the items were confirmed with available stock.";
        }
    }

    public void SetPaidStatus()
    {
        PaymentStatus = PaymentStatus.Paid;

        if (OrderStatus == OrderStatus.StockConfirmed)
        {
            AddDomainEvent(new OrderStatusChangedToPaidDomainEvent(Id, OrderItems));

            OrderStatus = OrderStatus.Paid;
            Description = "Payment confirmed.";
        }
    }

    public void SetPaymentFailedStatus()
    {
        PaymentStatus = PaymentStatus.Failed;
        SetCancelledStatus();
    }

    public void SetShippedStatus()
    {
        var canShip = OrderStatus == OrderStatus.Paid ||
                      (PaymentMethod == PaymentMethod.COD && OrderStatus == OrderStatus.StockConfirmed);

        if (!canShip)
        {
            StatusChangeException(OrderStatus.Shipped);
        }

        OrderStatus = OrderStatus.Shipped;
        Description = "The order was shipped.";
        AddDomainEvent(new OrderShippedDomainEvent(this));
    }

    public void SetDeliveredStatus()
    {
        if (OrderStatus != OrderStatus.Shipped)
        {
            StatusChangeException(OrderStatus.Delivered);
        }

        OrderStatus = OrderStatus.Delivered;
        if (PaymentMethod == PaymentMethod.COD && PaymentStatus == PaymentStatus.Unpaid)
        {
            PaymentStatus = PaymentStatus.Paid;
        }

        Description = "The order was delivered.";
    }

    public void SetCancelledStatus()
    {
        if (OrderStatus == OrderStatus.Paid ||
            OrderStatus == OrderStatus.Shipped ||
            OrderStatus == OrderStatus.Delivered)
        {
            StatusChangeException(OrderStatus.Cancelled);
        }

        OrderStatus = OrderStatus.Cancelled;
        Description = "The order was cancelled.";
        AddDomainEvent(new OrderCancelledDomainEvent(this));
    }

    public void SetCancelledStatusWhenStockIsRejected(IEnumerable<Guid> orderStockRejectedVariants)
    {
        if (OrderStatus == OrderStatus.AwaitingValidation)
        {
            OrderStatus = OrderStatus.Cancelled;

            var itemsStockRejectedProductNames = OrderItems
                .Where(c => orderStockRejectedVariants.Contains(c.VariantId))
                .Select(c => c.ProductName);

            var itemsStockRejectedDescription = string.Join(", ", itemsStockRejectedProductNames);
            Description = $"The product items don't have stock: ({itemsStockRejectedDescription}).";
        }
    }

    private void StatusChangeException(OrderStatus orderStatusToChange)
    {
        throw new OrderingDomainException($"Is not possible to change the order status from {OrderStatus} to {orderStatusToChange}.");
    }

    public long GetTotal() => _orderItems.Sum(o => (o.Units * o.UnitPrice) - o.Discount);
}
