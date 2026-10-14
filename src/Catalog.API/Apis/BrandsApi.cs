using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using eShop.Shared.Common;

namespace eShop.Catalog.API;

public static class BrandsApi
{
    public static IEndpointRouteBuilder MapBrandsApi(this IEndpointRouteBuilder app)
    {
        var vApi = app.NewVersionedApi("Catalog");
        var api = vApi.MapGroup("api/catalog").HasApiVersion(1, 0).HasApiVersion(2, 0);

        api.MapGet("/brands", GetAllBrands)
            .WithName("ListBrands")
            .WithSummary("List brands")
            .WithDescription("Get all active brands.")
            .WithTags("Brands");

        api.MapGet("/brands/{id:guid}", GetBrandById)
            .WithName("GetBrandById")
            .WithSummary("Get brand by ID")
            .WithTags("Brands");

        api.MapPost("/brands", CreateBrand)
            .WithName("CreateBrand")
            .WithSummary("Create brand")
            .WithTags("Brands");

        api.MapPut("/brands/{id:guid}", UpdateBrand)
            .WithName("UpdateBrand")
            .WithSummary("Update brand")
            .WithTags("Brands");

        api.MapDelete("/brands/{id:guid}", DeleteBrand)
            .WithName("DeleteBrand")
            .WithSummary("Soft-delete brand")
            .WithTags("Brands");

        return app;
    }

    public static async Task<Ok<ApiResponse<List<Brand>>>> GetAllBrands(CatalogContext context)
    {
        var brands = await context.Brands
            .AsNoTracking()
            .Where(b => b.Status != EntityStatus.Deleted)
            .OrderBy(b => b.Name)
            .ToListAsync();

        return TypedResults.Ok(ApiResponse<List<Brand>>.Ok(brands));
    }

    public static async Task<Results<Ok<ApiResponse<Brand>>, NotFound<ApiResponse<Brand>>>> GetBrandById(CatalogContext context, Guid id)
    {
        var brand = await context.Brands
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id && b.Status != EntityStatus.Deleted);

        return brand is null 
            ? TypedResults.NotFound(ApiResponse<Brand>.Fail($"Brand with id '{id}' was not found.", 404)) 
            : TypedResults.Ok(ApiResponse<Brand>.Ok(brand));
    }

    public static async Task<Results<Created<Brand>, BadRequest<string>>> CreateBrand(CatalogContext context, Brand brand)
    {
        if (string.IsNullOrWhiteSpace(brand.Name) || string.IsNullOrWhiteSpace(brand.SeoName))
        {
            return TypedResults.BadRequest("Brand name and seo_name are required.");
        }

        brand.Id = brand.Id == Guid.Empty ? Guid.CreateVersion7() : brand.Id;
        brand.CreatedAt = DateTime.UtcNow;
        brand.Status = string.IsNullOrWhiteSpace(brand.Status) ? EntityStatus.Active : brand.Status;

        context.Brands.Add(brand);
        await context.SaveChangesAsync();

        return TypedResults.Created($"/api/catalog/brands/{brand.Id}", brand);
    }

    public static async Task<Results<Ok<Brand>, NotFound>> UpdateBrand(CatalogContext context, Guid id, Brand updateDto)
    {
        var existing = await context.Brands.SingleOrDefaultAsync(b => b.Id == id && b.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Name = updateDto.Name;
        existing.SeoName = updateDto.SeoName;
        existing.Description = updateDto.Description;
        existing.ImageUrl = updateDto.ImageUrl;
        existing.Status = updateDto.Status;

        await context.SaveChangesAsync();
        return TypedResults.Ok(existing);
    }

    public static async Task<Results<NoContent, NotFound>> DeleteBrand(CatalogContext context, Guid id)
    {
        var existing = await context.Brands.SingleOrDefaultAsync(b => b.Id == id && b.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Status = EntityStatus.Deleted;
        await context.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
