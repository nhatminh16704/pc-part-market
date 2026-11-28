#nullable enable

using System.Text.Json.Serialization;

namespace eShop.Ordering.API.Application.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CheckoutSource
{
    BASKET = 1,
    BUY_NOW = 2
}

public class CheckoutSession
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public CheckoutSource Source { get; set; }
    public List<CheckoutItem> Items { get; set; } = [];
    public CheckoutShippingAddress? ShippingAddress { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;
    public string? VoucherCode { get; set; }
    public string? Note { get; set; }
    public long Subtotal { get; set; }
    public long ShippingFee { get; set; }
    public long DiscountAmount { get; set; }
    public long Total { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }

    public void RecalculateTotals()
    {
        Subtotal = Items.Sum(item => item.UnitPrice * item.Quantity);
        ShippingFee = 0;
        DiscountAmount = 0;
        Total = Math.Max(0, Subtotal + ShippingFee - DiscountAmount);
    }
}

public class CheckoutItem
{
    public Guid ProductId { get; set; }
    public Guid VariantId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? PictureUrl { get; set; }
    public long UnitPrice { get; set; }
    public int Quantity { get; set; }
}

public class CheckoutShippingAddress
{
    public string ReceiverName { get; set; } = string.Empty;
    public string ReceiverPhone { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Ward { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
}

