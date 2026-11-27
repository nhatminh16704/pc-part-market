namespace eShop.Ordering.API.Application.Commands;

public record SetStockRejectedOrderStatusCommand(int OrderNumber, List<Guid> OrderStockItems) : IRequest<bool>;
