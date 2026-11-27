namespace eShop.Ordering.API.Extensions;

public static class BasketItemExtensions
{
    public static IEnumerable<OrderItemDTO> ToOrderItemsDTO(this IEnumerable<BasketItem> basketItems)
    {
        foreach (var item in basketItems)
        {
            yield return item.ToOrderItemDTO();
        }
    }

    public static OrderItemDTO ToOrderItemDTO(this BasketItem item)
    {
        return new OrderItemDTO()
        {
            ProductId = item.ProductId,
            VariantId = item.VariantId,
            Sku = item.Sku,
            ProductName = item.ProductName,
            PictureUrl = item.PictureUrl,
            UnitPrice = item.UnitPrice,
            Units = item.Quantity
        };
    }
}
