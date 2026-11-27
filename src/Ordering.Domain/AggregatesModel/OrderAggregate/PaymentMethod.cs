using System.Text.Json.Serialization;

namespace eShop.Ordering.Domain.AggregatesModel.OrderAggregate;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentMethod
{
    COD = 1,
    VNPAY = 2,
    MOMO = 3,
    BANK_TRANSFER = 4
}

