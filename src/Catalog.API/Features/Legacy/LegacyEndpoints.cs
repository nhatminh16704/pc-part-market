using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using eShop.Shared.Common;

namespace eShop.Catalog.API.Features.Legacy;

public static class LegacyEndpoints
{
    public static IEndpointRouteBuilder MapLegacyEndpoints(this IEndpointRouteBuilder app)
    {
        var vApi = app.NewVersionedApi("Catalog");
        var api = vApi.MapGroup("api/catalog").HasApiVersion(1, 0).HasApiVersion(2, 0);

        api.MapGet("/items", GetLegacyItems)
            .WithName("GetLegacyItems")
            .WithTags("Compatibility");

        api.MapGet("/items/{id}", GetLegacyItemById)
            .WithName("GetLegacyItemById")
            .WithTags("Compatibility");

        api.MapGet("/items/by", GetLegacyItemsByIds)
            .WithName("GetLegacyItemsByIds")
            .WithTags("Compatibility");

        api.MapGet("/items/withsemanticrelevance", GetLegacyItemsWithSemanticRelevance)
            .WithName("GetLegacyItemsWithSemanticRelevance")
            .WithTags("Compatibility");

        api.MapGet("/catalogbrands", GetLegacyCatalogBrands)
            .WithName("GetLegacyCatalogBrands")
            .WithTags("Compatibility");

        api.MapGet("/catalogtypes", GetLegacyCatalogTypes)
            .WithName("GetLegacyCatalogTypes")
            .WithTags("Compatibility");

        api.MapGet("/items/{id}/pic", GetLegacyItemPicture)
            .WithName("GetLegacyItemPicture")
            .WithTags("Compatibility");

        return app;
    }

    public static async Task<IResult> GetLegacyItems(
        [AsParameters] PaginationRequest paginationRequest,
        CatalogContext context,
        string? name,
        int? brand,
        int? type)
    {
        var pageSize = paginationRequest.PageSize <= 0 ? 10 : paginationRequest.PageSize;
        var pageIndex = paginationRequest.PageIndex < 0 ? 0 : paginationRequest.PageIndex;

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

        var totalItems = await query.LongCountAsync();
        var products = await query
            .OrderBy(p => p.Name)
            .Skip(pageSize * pageIndex)
            .Take(pageSize)
            .ToListAsync();

        var legacyItems = products.Select(ToLegacyCatalogItem).ToList();

        return Results.Ok(new
        {
            pageIndex,
            pageSize,
            count = totalItems,
            data = legacyItems
        });
    }

    public static async Task<IResult> GetLegacyItemById(CatalogContext context, string id)
    {
        Product? product = null;
        if (Guid.TryParse(id, out var guid))
        {
            product = await context.Products
                .AsNoTracking()
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Include(p => p.Variants.Where(v => v.Status != EntityStatus.Deleted))
                .Include(p => p.Images)
                .SingleOrDefaultAsync(p => p.Id == guid && p.Status != EntityStatus.Deleted);
        }
        else if (int.TryParse(id, out var intId))
        {
            var all = await context.Products
                .AsNoTracking()
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Include(p => p.Variants.Where(v => v.Status != EntityStatus.Deleted))
                .Include(p => p.Images)
                .Where(p => p.Status != EntityStatus.Deleted)
                .ToListAsync();

            product = all.FirstOrDefault(p => Math.Abs(p.Id.GetHashCode()) == intId);
        }

        if (product == null)
        {
            return Results.NotFound();
        }

        return Results.Ok(ToLegacyCatalogItem(product));
    }

    public static async Task<IResult> GetLegacyItemsByIds(CatalogContext context, [FromQuery] string[] ids)
    {
        var idList = ids ?? [];
        var guids = idList.Where(i => Guid.TryParse(i, out _)).Select(Guid.Parse).ToHashSet();

        var products = await context.Products
            .AsNoTracking()
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Variants.Where(v => v.Status != EntityStatus.Deleted))
            .Include(p => p.Images)
            .Where(p => guids.Contains(p.Id) && p.Status != EntityStatus.Deleted)
            .ToListAsync();

        return Results.Ok(products.Select(ToLegacyCatalogItem).ToList());
    }

    public static async Task<IResult> GetLegacyItemsWithSemanticRelevance(
        [AsParameters] PaginationRequest paginationRequest,
        CatalogContext context,
        string? text)
    {
        return await GetLegacyItems(paginationRequest, context, text, null, null);
    }

    public static async Task<IResult> GetLegacyCatalogBrands(CatalogContext context)
    {
        var brands = await context.Brands
            .AsNoTracking()
            .Where(b => b.Status != EntityStatus.Deleted)
            .OrderBy(b => b.Name)
            .ToListAsync();

        var legacyBrands = brands.Select(b => new
        {
            id = Math.Abs(b.Id.GetHashCode()),
            brand = b.Name
        }).ToList();

        return Results.Ok(legacyBrands);
    }

    public static async Task<IResult> GetLegacyCatalogTypes(CatalogContext context)
    {
        var categories = await context.Categories
            .AsNoTracking()
            .Where(c => c.Status != EntityStatus.Deleted)
            .OrderBy(c => c.Name)
            .ToListAsync();

        var legacyTypes = categories.Select(c => new
        {
            id = Math.Abs(c.Id.GetHashCode()),
            type = c.Name
        }).ToList();

        return Results.Ok(legacyTypes);
    }

    public static async Task<IResult> GetLegacyItemPicture(
        CatalogContext context,
        IWebHostEnvironment environment,
        string id)
    {
        ProductImage? image = null;

        if (Guid.TryParse(id, out var guid))
        {
            image = await context.ProductImages
                .AsNoTracking()
                .Where(pi => pi.ProductId == guid)
                .OrderByDescending(pi => pi.IsMain)
                .FirstOrDefaultAsync();
        }
        else if (int.TryParse(id, out var intId))
        {
            var products = await context.Products
                .AsNoTracking()
                .Include(p => p.Images)
                .ToListAsync();

            var prod = products.FirstOrDefault(p => Math.Abs(p.Id.GetHashCode()) == intId);
            image = prod?.Images.OrderByDescending(i => i.IsMain).FirstOrDefault();
        }

        if (image == null)
        {
            return Results.NotFound();
        }

        if (image.ImageUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            image.ImageUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return Results.Redirect(image.ImageUrl);
        }

        var path = Path.Combine(environment.ContentRootPath, "Pics", image.ImageUrl);
        if (File.Exists(path))
        {
            return Results.File(path, "image/webp");
        }

        return Results.NotFound();
    }

    private static object ToLegacyCatalogItem(Product p)
    {
        var variant = p.Variants.FirstOrDefault();
        var mainImage = p.Images.FirstOrDefault(i => i.IsMain) ?? p.Images.FirstOrDefault();

        var intId = Math.Abs(p.Id.GetHashCode());
        var price = variant != null ? (decimal)variant.Price : 0m;
        var imageUrl = mainImage?.ImageUrl ?? string.Empty;

        return new
        {
            id = intId,
            name = p.Name,
            description = p.Description ?? string.Empty,
            price,
            pictureUrl = imageUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? imageUrl : $"/product-images/{p.Id}",
            catalogBrandId = p.BrandId.HasValue ? Math.Abs(p.BrandId.Value.GetHashCode()) : 0,
            catalogBrand = p.Brand != null ? new
            {
                id = Math.Abs(p.Brand.Id.GetHashCode()),
                brand = p.Brand.Name
            } : null,
            catalogTypeId = Math.Abs(p.CategoryId.GetHashCode()),
            catalogType = p.Category != null ? new
            {
                id = Math.Abs(p.Category.Id.GetHashCode()),
                type = p.Category.Name
            } : null
        };
    }
}
