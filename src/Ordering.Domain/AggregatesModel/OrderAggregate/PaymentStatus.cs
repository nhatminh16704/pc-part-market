using System.Text.Json.Serialization;

namespace eShop.Ordering.Domain.AggregatesModel.OrderAggregate;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentStatus
{
    Unpaid = 1,
    Paid = 2,
    Failed = 3,
    Refunded = 4
}

