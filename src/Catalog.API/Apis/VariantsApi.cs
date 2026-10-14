using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace eShop.Catalog.API;

public static class VariantsApi
{
    public static IEndpointRouteBuilder MapVariantsApi(this IEndpointRouteBuilder app)
    {
        var vApi = app.NewVersionedApi("Catalog");
        var api = vApi.MapGroup("api/catalog").HasApiVersion(1, 0).HasApiVersion(2, 0);

        api.MapGet("/products/{productId:guid}/variants", GetVariantsByProductId)
            .WithName("ListProductVariants")
            .WithSummary("List product variants")
            .WithDescription("Get all variants for a given product.")
            .WithTags("Variants");

        api.MapGet("/variants/{id:guid}", GetVariantById)
            .WithName("GetVariantById")
            .WithSummary("Get variant by ID")
            .WithDescription("Get a specific variant by its UUID.")
            .WithTags("Variants");

        api.MapPost("/products/{productId:guid}/variants", CreateVariant)
            .WithName("CreateVariant")
            .WithSummary("Create product variant")
            .WithDescription("Add a new variant to a product.")
            .WithTags("Variants");

        api.MapPut("/variants/{id:guid}", UpdateVariant)
            .WithName("UpdateVariant")
            .WithSummary("Update variant")
            .WithDescription("Update details of a product variant.")
            .WithTags("Variants");

        api.MapDelete("/variants/{id:guid}", DeleteVariant)
            .WithName("DeleteVariant")
            .WithSummary("Soft-delete variant")
            .WithDescription("Mark a product variant as deleted.")
            .WithTags("Variants");

        return app;
    }

    public static async Task<Ok<List<ProductVariant>>> GetVariantsByProductId(
        CatalogContext context,
        Guid productId)
    {
        var variants = await context.ProductVariants
            .AsNoTracking()
            .Where(v => v.ProductId == productId && v.Status != EntityStatus.Deleted)
            .ToListAsync();

        return TypedResults.Ok(variants);
    }

    public static async Task<Results<Ok<ProductVariant>, NotFound>> GetVariantById(
        CatalogContext context,
        Guid id)
    {
        var variant = await context.ProductVariants
            .AsNoTracking()
            .SingleOrDefaultAsync(v => v.Id == id && v.Status != EntityStatus.Deleted);

        return variant is null ? TypedResults.NotFound() : TypedResults.Ok(variant);
    }

    public static async Task<Results<Created<ProductVariant>, BadRequest<string>, NotFound>> CreateVariant(
        CatalogContext context,
        Guid productId,
        ProductVariant variant)
    {
        var productExists = await context.Products.AnyAsync(p => p.Id == productId && p.Status != EntityStatus.Deleted);
        if (!productExists)
        {
            return TypedResults.NotFound();
        }

        if (string.IsNullOrWhiteSpace(variant.Sku))
        {
            return TypedResults.BadRequest("Variant SKU is required.");
        }

        variant.Id = variant.Id == Guid.Empty ? Guid.CreateVersion7() : variant.Id;
        variant.ProductId = productId;
        variant.CreatedAt = DateTime.UtcNow;
        variant.Status = string.IsNullOrWhiteSpace(variant.Status) ? EntityStatus.Active : variant.Status;

        context.ProductVariants.Add(variant);
        await context.SaveChangesAsync();

        return TypedResults.Created($"/api/catalog/variants/{variant.Id}", variant);
    }

    public static async Task<Results<Ok<ProductVariant>, NotFound>> UpdateVariant(
        CatalogContext context,
        Guid id,
        ProductVariant updateDto)
    {
        var existing = await context.ProductVariants.SingleOrDefaultAsync(v => v.Id == id && v.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Price = updateDto.Price;
        existing.Quantity = updateDto.Quantity;
        existing.Sku = updateDto.Sku;
        existing.Model = updateDto.Model;
        existing.ImageUrl = updateDto.ImageUrl;
        existing.Description = updateDto.Description;
        existing.WarrantyMonths = updateDto.WarrantyMonths;
        existing.Barcode = updateDto.Barcode;
        existing.ReleaseAt = updateDto.ReleaseAt;
        existing.Status = updateDto.Status;
        existing.UpdatedAt = DateTime.UtcNow;
        existing.UpdatedBy = updateDto.UpdatedBy;

        await context.SaveChangesAsync();
        return TypedResults.Ok(existing);
    }

    public static async Task<Results<NoContent, NotFound>> DeleteVariant(
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
