namespace eShop.Ordering.API.Infrastructure;

public class OrderingContextSeed : IDbSeeder<OrderingContext>
{
    public Task SeedAsync(OrderingContext context) => Task.CompletedTask;
}
