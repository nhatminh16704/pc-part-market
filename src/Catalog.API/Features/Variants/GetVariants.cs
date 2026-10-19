using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Caching.Hybrid;
using eShop.Catalog.API.Common;

namespace eShop.Catalog.API.Features.Variants;

public static class GetVariantsHandler
{
    public static async Task<Ok<List<ProductVariant>>> ByProductId(
        CatalogContext context,
        HybridCache cache,
        Guid productId,
        CancellationToken cancellationToken)
    {
        var variants = await cache.GetOrCreateAsync(
            $"variants:product:{productId}",
            async cancel => await context.ProductVariants
                .AsNoTracking()
                .Where(v => v.ProductId == productId && v.Status != EntityStatus.Deleted)
                .ToListAsync(cancel),
            options: CatalogCachePolicies.ProductDetail,
            tags: [CatalogCachePolicies.ProductsTag, CatalogCachePolicies.ProductTag(productId)],
            cancellationToken: cancellationToken);

        return TypedResults.Ok(variants);
    }

    public static async Task<Results<Ok<ProductVariant>, NotFound>> ById(
        CatalogContext context,
        HybridCache cache,
        Guid id,
        CancellationToken cancellationToken)
    {
        var variant = await cache.GetOrCreateAsync(
            $"variant:{id}",
            async cancel => await context.ProductVariants
                .AsNoTracking()
                .SingleOrDefaultAsync(v => v.Id == id && v.Status != EntityStatus.Deleted, cancel),
            options: CatalogCachePolicies.ProductDetail,
            tags: [CatalogCachePolicies.ProductsTag],
            cancellationToken: cancellationToken);

        return variant is null ? TypedResults.NotFound() : TypedResults.Ok(variant);
    }
}
