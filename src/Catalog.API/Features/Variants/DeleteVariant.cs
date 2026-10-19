using Microsoft.AspNetCore.Http.HttpResults;
using eShop.Catalog.API.Common;

namespace eShop.Catalog.API.Features.Variants;

public static class DeleteVariantHandler
{
    public static async Task<Results<NoContent, NotFound>> Handle(
        CatalogContext context,
        ICacheInvalidator invalidator,
        Guid id,
        CancellationToken cancellationToken)
    {
        var existing = await context.ProductVariants.SingleOrDefaultAsync(v => v.Id == id && v.Status != EntityStatus.Deleted, cancellationToken);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Status = EntityStatus.Deleted;
        existing.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        // Invalidate parent product detail, variant list, and catalog listings
        var productId = existing.ProductId;
        await invalidator.EvictTagAsync(CatalogCachePolicies.ProductTag(productId), cancellationToken);
        await invalidator.EvictKeyAsync(CatalogCachePolicies.ProductKey(productId), cancellationToken);
        await invalidator.EvictKeyAsync($"variants:product:{productId}", cancellationToken);
        await invalidator.EvictKeyAsync($"variant:{id}", cancellationToken);
        await invalidator.EvictTagAsync(CatalogCachePolicies.ProductsListTag, cancellationToken);
        await invalidator.EvictTagAsync(CatalogCachePolicies.ProductsSearchTag, cancellationToken);

        return TypedResults.NoContent();
    }
}
