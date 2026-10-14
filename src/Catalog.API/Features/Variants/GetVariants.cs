using Microsoft.AspNetCore.Http.HttpResults;

namespace eShop.Catalog.API.Features.Variants;

public static class GetVariantsHandler
{
    public static async Task<Ok<List<ProductVariant>>> ByProductId(
        CatalogContext context,
        Guid productId)
    {
        var variants = await context.ProductVariants
            .AsNoTracking()
            .Where(v => v.ProductId == productId && v.Status != EntityStatus.Deleted)
            .ToListAsync();

        return TypedResults.Ok(variants);
    }

    public static async Task<Results<Ok<ProductVariant>, NotFound>> ById(
        CatalogContext context,
        Guid id)
    {
        var variant = await context.ProductVariants
            .AsNoTracking()
            .SingleOrDefaultAsync(v => v.Id == id && v.Status != EntityStatus.Deleted);

        return variant is null ? TypedResults.NotFound() : TypedResults.Ok(variant);
    }
}
