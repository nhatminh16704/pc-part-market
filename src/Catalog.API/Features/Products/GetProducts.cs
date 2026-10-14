using System.ComponentModel;
using Microsoft.AspNetCore.Http.HttpResults;
using eShop.Shared.Common;

namespace eShop.Catalog.API.Features.Products;

public static class GetProductsHandler
{
    public static async Task<Ok<ApiResponse<PaginatedItems<Product>>>> GetAll(
        [AsParameters] PaginationRequest paginationRequest,
        CatalogContext context,
        [Description("Search term for product name")] string? name,
        [Description("Filter by brand UUID")] Guid? brandId,
        [Description("Filter by category UUID")] Guid? categoryId)
    {
        var pageSize = paginationRequest.PageSize;
        var pageIndex = paginationRequest.PageIndex;

        var query = context.Products
            .AsNoTracking()
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Variants.Where(v => v.Status != EntityStatus.Deleted))
            .Include(p => p.Images)
            .Where(p => p.Status != EntityStatus.Deleted);

        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(p => EF.Functions.ILike(p.Name, $"%{name}%"));
        }
        if (brandId.HasValue)
        {
            query = query.Where(p => p.BrandId == brandId.Value);
        }
        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        var totalItems = await query.LongCountAsync();
        var itemsOnPage = await query
            .OrderBy(p => p.Name)
            .Skip(pageSize * pageIndex)
            .Take(pageSize)
            .ToListAsync();

        var pagedData = new PaginatedItems<Product>(pageIndex, pageSize, totalItems, itemsOnPage);
        return TypedResults.Ok(ApiResponse<PaginatedItems<Product>>.Ok(pagedData));
    }

    public static async Task<Results<Ok<ApiResponse<Product>>, NotFound<ApiResponse<Product>>>> ById(
        CatalogContext context,
        Guid id)
    {
        var product = await context.Products
            .AsNoTracking()
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Variants.Where(v => v.Status != EntityStatus.Deleted))
            .Include(p => p.Images)
            .SingleOrDefaultAsync(p => p.Id == id && p.Status != EntityStatus.Deleted);

        return product is null
            ? TypedResults.NotFound(ApiResponse<Product>.Fail($"Product with id '{id}' was not found.", 404))
            : TypedResults.Ok(ApiResponse<Product>.Ok(product));
    }

    public static async Task<Results<Ok<ApiResponse<Product>>, NotFound<ApiResponse<Product>>>> BySeoName(
        CatalogContext context,
        string seoName)
    {
        var product = await context.Products
            .AsNoTracking()
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Variants.Where(v => v.Status != EntityStatus.Deleted))
            .Include(p => p.Images)
            .SingleOrDefaultAsync(p => p.SeoName == seoName && p.Status != EntityStatus.Deleted);

        return product is null
            ? TypedResults.NotFound(ApiResponse<Product>.Fail($"Product with seoName '{seoName}' was not found.", 404))
            : TypedResults.Ok(ApiResponse<Product>.Ok(product));
    }
}
