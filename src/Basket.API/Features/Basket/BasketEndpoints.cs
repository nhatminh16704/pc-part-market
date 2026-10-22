using System.Security.Claims;
using eShop.Basket.API.Model;
using eShop.Basket.API.Repositories;
using eShop.Basket.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eShop.Basket.API.Features.Basket;

public static class BasketEndpoints
{
    public static IEndpointRouteBuilder MapBasketEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/basket")
            .WithTags("Basket");

        group.MapGet("/", GetBasketAsync)
            .WithName("GetBasket")
            .WithSummary("Get current customer basket")
            .WithDescription("Retrieves the basket for the current authenticated user or anonymous guest ID.");

        group.MapPost("/", SyncBasketAsync)
            .WithName("SyncBasket")
            .WithSummary("Sync / Merge full basket")
            .WithDescription("Replaces or merges the basket, refreshing variant prices and stock from catalog.");

        group.MapPost("/items", AddItemToBasketAsync)
            .WithName("AddItemToBasket")
            .WithSummary("Add item to basket")
            .WithDescription("Adds an item by ProductId and VariantId. Price is fetched automatically from Catalog.API.");

        group.MapPut("/items/{productId:guid}/{variantId:guid}", UpdateItemQuantityAsync)
            .WithName("UpdateItemQuantity")
            .WithSummary("Update item quantity in basket")
            .WithDescription("Updates the quantity of a specific variant in the basket. Deletes item if quantity <= 0.");

        group.MapDelete("/items/{productId:guid}/{variantId:guid}", RemoveItemFromBasketAsync)
            .WithName("RemoveItemFromBasket")
            .WithSummary("Remove item from basket")
            .WithDescription("Removes a specific item from the basket.");

        group.MapDelete("/", ClearBasketAsync)
            .WithName("ClearBasket")
            .WithSummary("Clear entire basket")
            .WithDescription("Deletes the entire basket for the current user/guest.");

        return app;
    }

    public static async Task<IResult> GetBasketAsync(
        HttpContext httpContext,
        IBasketRepository repository,
        ICatalogApiClient catalogClient,
        CancellationToken cancellationToken)
    {
        var buyerId = ResolveBuyerId(httpContext);
        var basket = await repository.GetBasketAsync(buyerId) ?? new CustomerBasket(buyerId);

        // Optionally refresh current prices from catalog
        var hasUpdated = false;
        foreach (var item in basket.Items)
        {
            var variant = await catalogClient.GetVariantAsync(item.VariantId, cancellationToken);
            if (variant is not null && variant.Price != item.UnitPrice)
            {
                item.OldUnitPrice = item.UnitPrice;
                item.UnitPrice = variant.Price;
                hasUpdated = true;
            }
        }

        if (hasUpdated)
        {
            await repository.UpdateBasketAsync(basket);
        }

        return Results.Ok(ToResponse(basket));
    }

    public static async Task<IResult> SyncBasketAsync(
        [FromBody] SyncBasketRequest request,
        HttpContext httpContext,
        IBasketRepository repository,
        ICatalogApiClient catalogClient,
        CancellationToken cancellationToken)
    {
        var buyerId = ResolveBuyerId(httpContext);
        var basket = await repository.GetBasketAsync(buyerId) ?? new CustomerBasket(buyerId);

        foreach (var reqItem in request.Items)
        {
            if (reqItem.Quantity < 1) continue;

            var variant = await catalogClient.GetVariantAsync(reqItem.VariantId, cancellationToken);
            if (variant is null) continue;

            var product = await catalogClient.GetProductAsync(variant.ProductId, cancellationToken);
            var existing = basket.Items.FirstOrDefault(i => i.ProductId == reqItem.ProductId && i.VariantId == reqItem.VariantId);

            var availableQty = Math.Min(reqItem.Quantity, Math.Max(1, variant.Quantity));

            if (existing is not null)
            {
                existing.Quantity = availableQty;
                if (existing.UnitPrice != variant.Price)
                {
                    existing.OldUnitPrice = existing.UnitPrice;
                    existing.UnitPrice = variant.Price;
                }
            }
            else
            {
                basket.Items.Add(new BasketItem
                {
                    ProductId = variant.ProductId,
                    VariantId = variant.Id,
                    ProductName = product?.Name ?? variant.Model ?? "Linh kiện PC",
                    Sku = variant.Sku,
                    PictureUrl = variant.ImageUrl,
                    UnitPrice = variant.Price,
                    OldUnitPrice = variant.Price,
                    Quantity = availableQty
                });
            }
        }

        await repository.UpdateBasketAsync(basket);
        return Results.Ok(ToResponse(basket));
    }

    public static async Task<IResult> AddItemToBasketAsync(
        [FromBody] AddBasketItemRequest request,
        HttpContext httpContext,
        IBasketRepository repository,
        ICatalogApiClient catalogClient,
        CancellationToken cancellationToken)
    {
        if (request.Quantity < 1)
        {
            return Results.BadRequest(new { message = "Quantity must be at least 1." });
        }

        var variant = await catalogClient.GetVariantAsync(request.VariantId, cancellationToken);
        if (variant is null)
        {
            return Results.NotFound(new { message = $"Product variant '{request.VariantId}' was not found in catalog." });
        }

        if (variant.Quantity <= 0)
        {
            return Results.BadRequest(new { message = "Sản phẩm này hiện đang hết hàng." });
        }

        var buyerId = ResolveBuyerId(httpContext);
        var basket = await repository.GetBasketAsync(buyerId) ?? new CustomerBasket(buyerId);

        var existingItem = basket.Items.FirstOrDefault(i => i.ProductId == request.ProductId && i.VariantId == request.VariantId);
        if (existingItem is not null)
        {
            var nextQty = existingItem.Quantity + request.Quantity;
            existingItem.Quantity = Math.Min(nextQty, variant.Quantity);

            if (existingItem.UnitPrice != variant.Price)
            {
                existingItem.OldUnitPrice = existingItem.UnitPrice;
                existingItem.UnitPrice = variant.Price;
            }
        }
        else
        {
            var product = await catalogClient.GetProductAsync(variant.ProductId, cancellationToken);
            var initialQty = Math.Min(request.Quantity, variant.Quantity);

            basket.Items.Add(new BasketItem
            {
                ProductId = variant.ProductId,
                VariantId = variant.Id,
                ProductName = product?.Name ?? variant.Model ?? "Linh kiện PC",
                Sku = variant.Sku,
                PictureUrl = variant.ImageUrl,
                UnitPrice = variant.Price,
                OldUnitPrice = variant.Price,
                Quantity = initialQty
            });
        }

        await repository.UpdateBasketAsync(basket);
        return Results.Ok(ToResponse(basket));
    }

    public static async Task<IResult> UpdateItemQuantityAsync(
        [FromRoute] Guid productId,
        [FromRoute] Guid variantId,
        [FromBody] UpdateQuantityRequest request,
        HttpContext httpContext,
        IBasketRepository repository,
        ICatalogApiClient catalogClient,
        CancellationToken cancellationToken)
    {
        var buyerId = ResolveBuyerId(httpContext);
        var basket = await repository.GetBasketAsync(buyerId);
        if (basket is null)
        {
            return Results.NotFound(new { message = "Basket not found." });
        }

        var item = basket.Items.FirstOrDefault(i => i.ProductId == productId && i.VariantId == variantId);
        if (item is null)
        {
            return Results.NotFound(new { message = "Item not found in basket." });
        }

        if (request.Quantity <= 0)
        {
            basket.Items.Remove(item);
        }
        else
        {
            var variant = await catalogClient.GetVariantAsync(variantId, cancellationToken);
            if (variant is not null)
            {
                item.Quantity = Math.Min(request.Quantity, Math.Max(1, variant.Quantity));
                if (item.UnitPrice != variant.Price)
                {
                    item.OldUnitPrice = item.UnitPrice;
                    item.UnitPrice = variant.Price;
                }
            }
            else
            {
                item.Quantity = request.Quantity;
            }
        }

        await repository.UpdateBasketAsync(basket);
        return Results.Ok(ToResponse(basket));
    }

    public static async Task<IResult> RemoveItemFromBasketAsync(
        [FromRoute] Guid productId,
        [FromRoute] Guid variantId,
        HttpContext httpContext,
        IBasketRepository repository)
    {
        var buyerId = ResolveBuyerId(httpContext);
        var basket = await repository.GetBasketAsync(buyerId);
        if (basket is null)
        {
            return Results.NotFound(new { message = "Basket not found." });
        }

        var item = basket.Items.FirstOrDefault(i => i.ProductId == productId && i.VariantId == variantId);
        if (item is not null)
        {
            basket.Items.Remove(item);
            await repository.UpdateBasketAsync(basket);
        }

        return Results.Ok(ToResponse(basket));
    }

    public static async Task<IResult> ClearBasketAsync(
        HttpContext httpContext,
        IBasketRepository repository)
    {
        var buyerId = ResolveBuyerId(httpContext);
        await repository.DeleteBasketAsync(buyerId);
        return Results.Ok(new { message = "Basket cleared successfully." });
    }

    private static string ResolveBuyerId(HttpContext httpContext)
    {
        var userId = httpContext.User.FindFirst("sub")?.Value
                  ?? httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            return userId;
        }

        if (httpContext.Request.Headers.TryGetValue("X-Buyer-Id", out var headerVal) && !string.IsNullOrWhiteSpace(headerVal))
        {
            return headerVal.ToString();
        }

        if (httpContext.Request.Query.TryGetValue("buyerId", out var queryVal) && !string.IsNullOrWhiteSpace(queryVal))
        {
            return queryVal.ToString();
        }

        return "guest-session";
    }

    private static BasketResponse ToResponse(CustomerBasket basket)
    {
        var dtos = basket.Items.Select(item =>
        {
            var lineTotal = item.UnitPrice * item.Quantity;
            var isChanged = item.OldUnitPrice > 0 && item.OldUnitPrice != item.UnitPrice;
            return new BasketItemDto(
                item.ProductId,
                item.VariantId,
                item.ProductName,
                item.Sku,
                item.PictureUrl,
                item.UnitPrice,
                item.OldUnitPrice,
                item.Quantity,
                lineTotal,
                isChanged
            );
        }).ToList();

        var totalCount = dtos.Sum(i => i.Quantity);
        var totalAmount = dtos.Sum(i => i.LineTotal);
        var hasChanges = dtos.Any(i => i.IsPriceChanged);

        return new BasketResponse(
            basket.BuyerId,
            dtos,
            totalCount,
            totalAmount,
            hasChanges
        );
    }
}
