namespace eShop.Basket.API.Features.Basket;

public record BasketResponse(
    string BuyerId,
    List<BasketItemDto> Items,
    int TotalCount,
    long TotalAmount,
    bool HasPriceChanges
);

public record BasketItemDto(
    Guid ProductId,
    Guid VariantId,
    string ProductName,
    string Sku,
    string? PictureUrl,
    long UnitPrice,
    long OldUnitPrice,
    int Quantity,
    long LineTotal,
    bool IsPriceChanged
);

public record AddBasketItemRequest(
    Guid ProductId,
    Guid VariantId,
    int Quantity = 1
);

public record UpdateQuantityRequest(
    int Quantity
);

public record SyncBasketItemRequest(
    Guid ProductId,
    Guid VariantId,
    int Quantity
);

public record SyncBasketRequest(
    List<SyncBasketItemRequest> Items
);
