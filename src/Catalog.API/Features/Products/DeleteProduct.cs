using Microsoft.AspNetCore.Http.HttpResults;
using eShop.Catalog.API.Common;

namespace eShop.Catalog.API.Features.Products;

public static class DeleteProductHandler
{
    public static async Task<Results<NoContent, NotFound>> Handle(
        CatalogContext context,
        ICacheInvalidator invalidator,
        Guid id,
        CancellationToken cancellationToken)
    {
        var existing = await context.Products.SingleOrDefaultAsync(p => p.Id == id && p.Status != EntityStatus.Deleted, cancellationToken);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Status = EntityStatus.Deleted;
        existing.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        // Invalidate specific product detail cache across all instances
        await invalidator.EvictTagAsync(CatalogCachePolicies.ProductTag(id), cancellationToken);
        await invalidator.EvictKeyAsync(CatalogCachePolicies.ProductKey(id), cancellationToken);
        if (!string.IsNullOrWhiteSpace(existing.SeoName))
        {
            await invalidator.EvictKeyAsync(CatalogCachePolicies.ProductSeoKey(existing.SeoName), cancellationToken);
        }

        // Invalidate listing and search cache across all instances
        await invalidator.EvictTagAsync(CatalogCachePolicies.ProductsListTag, cancellationToken);
        await invalidator.EvictTagAsync(CatalogCachePolicies.ProductsSearchTag, cancellationToken);

        return TypedResults.NoContent();
    }
}
