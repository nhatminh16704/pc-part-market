using Microsoft.AspNetCore.Http.HttpResults;

namespace eShop.Catalog.API.Features.Products;

public static class DeleteProductHandler
{
    public static async Task<Results<NoContent, NotFound>> Handle(
        CatalogContext context,
        Guid id)
    {
        var existing = await context.Products.SingleOrDefaultAsync(p => p.Id == id && p.Status != EntityStatus.Deleted);
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
