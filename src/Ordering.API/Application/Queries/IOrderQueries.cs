namespace eShop.Ordering.API.Application.Queries;

public interface IOrderQueries
{
    Task<Order> GetOrderAsync(int id);

    Task<Order> GetOrderByNumberAsync(string orderNumber);

    Task<IEnumerable<OrderSummary>> GetOrdersFromUserAsync(Guid customerId);
}
