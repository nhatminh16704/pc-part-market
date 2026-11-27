#nullable enable

namespace eShop.Ordering.Domain.AggregatesModel.OrderAggregate;

public class OrderStatusHistory : Entity
{
    public OrderStatus? FromStatus { get; private set; }

    public OrderStatus ToStatus { get; private set; }

    public string? Note { get; private set; }

    public string ChangedBy { get; private set; } = "SYSTEM";

    public DateTime CreatedAt { get; private set; }

    protected OrderStatusHistory() { }

    public OrderStatusHistory(
        OrderStatus? fromStatus,
        OrderStatus toStatus,
        string? note = null,
        string? changedBy = null)
    {
        FromStatus = fromStatus;
        ToStatus = toStatus;
        Note = note;
        ChangedBy = string.IsNullOrWhiteSpace(changedBy) ? "SYSTEM" : changedBy;
        CreatedAt = DateTime.UtcNow;
    }
}
