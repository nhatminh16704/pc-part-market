#nullable enable

namespace eShop.Ordering.API.Application.Models;

public class BasketItem
{
    public Guid ProductId { get; init; }
    public Guid VariantId { get; init; }
    public string Sku { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public long UnitPrice { get; init; }
    public long OldUnitPrice { get; init; }
    public int Quantity { get; init; }
    public string? PictureUrl { get; init; }
}
