#nullable enable

using System.ComponentModel.DataAnnotations;

namespace eShop.Ordering.Domain.AggregatesModel.OrderAggregate;

public class OrderItem : Entity
{
    public Guid ProductId { get; private set; }

    public Guid VariantId { get; private set; }

    [Required]
    public string Sku { get; private set; } = string.Empty;

    [Required]
    public string ProductName { get; private set; } = string.Empty;

    public string? PictureUrl { get; private set; }

    public long UnitPrice { get; private set; }

    public long Discount { get; private set; }

    public int Units { get; private set; }

    protected OrderItem() { }

    public OrderItem(
        Guid productId,
        Guid variantId,
        string sku,
        string productName,
        long unitPrice,
        long discount,
        string? pictureUrl,
        int units = 1)
    {
        if (units <= 0)
        {
            throw new OrderingDomainException("Invalid number of units");
        }

        if ((unitPrice * units) < discount)
        {
            throw new OrderingDomainException("The total of order item is lower than applied discount");
        }

        ProductId = productId;
        VariantId = variantId;
        Sku = sku;
        ProductName = productName;
        UnitPrice = unitPrice;
        Discount = discount;
        Units = units;
        PictureUrl = pictureUrl;
    }

    public void SetNewDiscount(long discount)
    {
        if (discount < 0)
        {
            throw new OrderingDomainException("Discount is not valid");
        }

        Discount = discount;
    }

    public void AddUnits(int units)
    {
        if (units < 0)
        {
            throw new OrderingDomainException("Invalid units");
        }

        Units += units;
    }
}
