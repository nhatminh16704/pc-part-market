namespace eShop.Contracts;

public record OrderStockItem(Guid ProductId, Guid VariantId, int Units);
