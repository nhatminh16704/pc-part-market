#nullable enable

namespace eShop.Ordering.API.Application.Commands;

using eShop.Ordering.API.Extensions;
using eShop.Ordering.Domain.AggregatesModel.OrderAggregate;

public class CreateOrderDraftCommandHandler
    : IRequestHandler<CreateOrderDraftCommand, OrderDraftDTO>
{
    public Task<OrderDraftDTO> Handle(CreateOrderDraftCommand message, CancellationToken cancellationToken)
    {
        var order = Order.NewDraft();
        var orderItems = message.Items.Select(i => i.ToOrderItemDTO());
        foreach (var item in orderItems)
        {
            order.AddOrderItem(item.ProductId, item.VariantId, item.Sku, item.ProductName, item.UnitPrice, item.Discount, item.PictureUrl, item.Units);
        }

        return Task.FromResult(OrderDraftDTO.FromOrder(order));
    }
}

public record OrderDraftDTO
{
    public IEnumerable<OrderItemDTO> OrderItems { get; init; } = [];
    public long Total { get; init; }

    public static OrderDraftDTO FromOrder(Order order)
    {
        return new OrderDraftDTO()
        {
            OrderItems = order.OrderItems.Select(oi => new OrderItemDTO
            {
                Discount = oi.Discount,
                ProductId = oi.ProductId,
                VariantId = oi.VariantId,
                Sku = oi.Sku,
                UnitPrice = oi.UnitPrice,
                PictureUrl = oi.PictureUrl,
                Units = oi.Units,
                ProductName = oi.ProductName
            }),
            Total = order.GetTotal()
        };
    }
}

public record OrderItemDTO
{
    public Guid ProductId { get; init; }

    public Guid VariantId { get; init; }

    public string Sku { get; init; } = string.Empty;

    public string ProductName { get; init; } = string.Empty;

    public long UnitPrice { get; init; }

    public long Discount { get; init; }

    public int Units { get; init; }

    public string? PictureUrl { get; init; }
}
