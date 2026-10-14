using Microsoft.AspNetCore.Http.HttpResults;

namespace eShop.Catalog.API.Features.Variants;

public static class DeleteVariantHandler
{
    public static async Task<Results<NoContent, NotFound>> Handle(
        CatalogContext context,
        Guid id)
    {
        var existing = await context.ProductVariants.SingleOrDefaultAsync(v => v.Id == id && v.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Status = EntityStatus.Deleted;
        existing.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
