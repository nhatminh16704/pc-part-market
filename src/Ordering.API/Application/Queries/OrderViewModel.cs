#nullable enable

namespace eShop.Ordering.API.Application.Queries;

public record Orderitem
{
    public Guid ProductId { get; init; }
    public Guid VariantId { get; init; }
    public string Sku { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public int Units { get; init; }
    public long UnitPrice { get; init; }
    public long Discount { get; init; }
    public string? PictureUrl { get; init; }
}

public record Order
{
    public int OrderNumber { get; init; }
    public DateTime Date { get; init; }
    public string Status { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public string PaymentStatus { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string ReceiverName { get; init; } = string.Empty;
    public string ReceiverPhone { get; init; } = string.Empty;
    public string Province { get; init; } = string.Empty;
    public string District { get; init; } = string.Empty;
    public string Ward { get; init; } = string.Empty;
    public string StreetAddress { get; init; } = string.Empty;
    public string? PostalCode { get; init; }
    public List<Orderitem> OrderItems { get; set; } = [];
    public long Total { get; set; }
}

public record OrderSummary
{
    public int OrderNumber { get; init; }
    public DateTime Date { get; init; }
    public string Status { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public string PaymentStatus { get; init; } = string.Empty;
    public long Total { get; init; }
}
