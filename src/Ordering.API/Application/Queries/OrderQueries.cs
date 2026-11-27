namespace eShop.Ordering.API.Application.Queries;

public class OrderQueries(OrderingContext context)
    : IOrderQueries
{
    public async Task<Order> GetOrderAsync(int id)
    {
        var order = await context.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .Include(o => o.StatusHistories)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            throw new KeyNotFoundException();

        return MapToOrderViewModel(order);
    }

    public async Task<Order> GetOrderByNumberAsync(string orderNumber)
    {
        var order = await context.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .Include(o => o.StatusHistories)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        if (order is null)
            throw new KeyNotFoundException();

        return MapToOrderViewModel(order);
    }

    public async Task<IEnumerable<OrderSummary>> GetOrdersFromUserAsync(Guid customerId)
    {
        return await context.Orders
            .AsNoTracking()
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderSummary
            {
                OrderId = o.Id,
                OrderNumber = o.OrderNumber,
                Date = o.OrderDate,
                Status = o.OrderStatus.ToString(),
                PaymentMethod = o.PaymentMethod.ToString(),
                PaymentStatus = o.PaymentStatus.ToString(),
                Total = o.OrderItems.Sum(oi => (oi.UnitPrice * oi.Units) - oi.Discount)
            })
            .ToListAsync();
    }

    private static Order MapToOrderViewModel(Domain.AggregatesModel.OrderAggregate.Order order)
    {
        return new Order
        {
            OrderId = order.Id,
            OrderNumber = order.OrderNumber,
            Date = order.OrderDate,
            Description = order.Description,
            Status = order.OrderStatus.ToString(),
            PaymentMethod = order.PaymentMethod.ToString(),
            PaymentStatus = order.PaymentStatus.ToString(),
            ReceiverName = order.Address.ReceiverName,
            ReceiverPhone = order.Address.ReceiverPhone,
            Province = order.Address.Province,
            District = order.Address.District,
            Ward = order.Address.Ward,
            StreetAddress = order.Address.StreetAddress,
            PostalCode = order.Address.PostalCode,
            Total = order.GetTotal(),
            OrderItems = order.OrderItems.Select(oi => new Orderitem
            {
                ProductId = oi.ProductId,
                VariantId = oi.VariantId,
                Sku = oi.Sku,
                ProductName = oi.ProductName,
                Units = oi.Units,
                UnitPrice = oi.UnitPrice,
                Discount = oi.Discount,
                PictureUrl = oi.PictureUrl
            }).ToList(),
            StatusHistories = order.StatusHistories
                .OrderBy(h => h.CreatedAt)
                .Select(h => new OrderStatusHistoryDto(
                    h.FromStatus?.ToString(),
                    h.ToStatus.ToString(),
                    h.Note,
                    h.ChangedBy,
                    h.CreatedAt))
                .ToList()
        };
    }
}
