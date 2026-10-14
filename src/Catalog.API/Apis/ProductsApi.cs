using System.ComponentModel;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using eShop.Shared.Common;

namespace eShop.Catalog.API;

public static class ProductsApi
{
    public static IEndpointRouteBuilder MapProductsApi(this IEndpointRouteBuilder app)
    {
        var vApi = app.NewVersionedApi("Catalog");
        var api = vApi.MapGroup("api/catalog").HasApiVersion(1, 0).HasApiVersion(2, 0);

        api.MapGet("/products", GetAllProducts)
            .WithName("ListProducts")
            .WithSummary("List products")
            .WithDescription("Get a paginated list of products.")
            .WithTags("Products");

        api.MapGet("/products/{id:guid}", GetProductById)
            .WithName("GetProductById")
            .WithSummary("Get product by ID")
            .WithDescription("Get a product by its unique UUID.")
            .WithTags("Products");

        api.MapGet("/products/seo/{seoName}", GetProductBySeoName)
            .WithName("GetProductBySeoName")
            .WithSummary("Get product by SEO name")
            .WithDescription("Get a product by its unique SEO name.")
            .WithTags("Products");

        api.MapPost("/products/search", SearchProducts)
            .WithName("SearchProducts")
            .WithSummary("Search products by criteria")
            .WithDescription("Search products with structured filter criteria including keyword, category, brand, price range, and specs.")
            .WithTags("Products");

        api.MapPost("/products", CreateProduct)
            .WithName("CreateProduct")
            .WithSummary("Create a new product")
            .WithDescription("Create a new product in the catalog.")
            .WithTags("Products");

        api.MapPut("/products/{id:guid}", UpdateProduct)
            .WithName("UpdateProduct")
            .WithSummary("Update a product")
            .WithDescription("Update details of an existing product.")
            .WithTags("Products");

        api.MapDelete("/products/{id:guid}", DeleteProduct)
            .WithName("DeleteProduct")
            .WithSummary("Soft-delete a product")
            .WithDescription("Mark a product as deleted.")
            .WithTags("Products");

        return app;
    }

    public static async Task<Ok<ApiResponse<PaginatedItems<Product>>>> GetAllProducts(
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

    public static async Task<Ok<ApiResponse<PaginatedItems<ProductSearchItemDto>>>> SearchProducts(
        CatalogContext context,
        [FromBody] ProductSearchRequest req)
    {
        var pageSize = req.PageSize <= 0 ? 10 : Math.Min(req.PageSize, 50);
        var pageIndex = req.PageIndex < 0 ? 0 : req.PageIndex;

        var query = context.Products
            .AsNoTracking()
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Variants.Where(v => v.Status != EntityStatus.Deleted))
            .Include(p => p.Images)
            .Where(p => p.Status != EntityStatus.Deleted);

        if (!string.IsNullOrWhiteSpace(req.Keyword))
        {
            var kw = req.Keyword.Trim();
            query = query.Where(p =>
                EF.Functions.ILike(p.Name, $"%{kw}%") ||
                (p.Description != null && EF.Functions.ILike(p.Description, $"%{kw}%")));
        }

        if (!string.IsNullOrWhiteSpace(req.Category))
        {
            var cat = req.Category.Trim();
            if (Guid.TryParse(cat, out var catId))
            {
                query = query.Where(p => p.CategoryId == catId);
            }
            else
            {
                query = query.Where(p =>
                    EF.Functions.ILike(p.Category.Name, $"%{cat}%") ||
                    EF.Functions.ILike(p.Category.SeoName, $"%{cat}%"));
            }
        }

        if (!string.IsNullOrWhiteSpace(req.Brand))
        {
            var b = req.Brand.Trim();
            if (Guid.TryParse(b, out var brandId))
            {
                query = query.Where(p => p.BrandId == brandId);
            }
            else
            {
                query = query.Where(p => p.Brand != null && (
                    EF.Functions.ILike(p.Brand.Name, $"%{b}%") ||
                    EF.Functions.ILike(p.Brand.SeoName, $"%{b}%")));
            }
        }

        if (req.MinPrice.HasValue)
        {
            query = query.Where(p => p.Variants.Any(v => v.Status != EntityStatus.Deleted && v.Price >= req.MinPrice.Value));
        }

        if (req.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Variants.Any(v => v.Status != EntityStatus.Deleted && v.Price <= req.MaxPrice.Value));
        }

        if (req.Specs != null && req.Specs.Count > 0)
        {
            foreach (var kvp in req.Specs)
            {
                var specKey = kvp.Key?.Trim();
                var specVal = kvp.Value?.Trim();
                if (string.IsNullOrWhiteSpace(specKey) || string.IsNullOrWhiteSpace(specVal)) continue;

                if (int.TryParse(specVal, out var intVal))
                {
                    var jsonNum = $"{{\"{specKey}\":{intVal}}}";
                    query = query.Where(p =>
                        (p.SpecsNormalized != null && EF.Functions.JsonContains(p.SpecsNormalized, jsonNum)) ||
                        (p.SpecsNormalized == null && EF.Functions.ILike(p.Name, $"%{specVal}%")));
                }
                else if (bool.TryParse(specVal, out var boolVal))
                {
                    var jsonBool = $"{{\"{specKey}\":{(boolVal ? "true" : "false")}}}";
                    query = query.Where(p =>
                        (p.SpecsNormalized != null && EF.Functions.JsonContains(p.SpecsNormalized, jsonBool)) ||
                        (p.SpecsNormalized == null && EF.Functions.ILike(p.Name, $"%{specVal}%")));
                }
                else
                {
                    var jsonStr = $"{{\"{specKey}\":\"{specVal}\"}}";
                    query = query.Where(p =>
                        (p.SpecsNormalized != null && EF.Functions.JsonContains(p.SpecsNormalized, jsonStr)) ||
                        (p.SpecsNormalized == null && (EF.Functions.ILike(p.Name, $"%{specVal}%") || (p.Description != null && EF.Functions.ILike(p.Description, $"%{specVal}%")))));
                }
            }
        }

        var totalItems = await query.LongCountAsync();
        var products = await query
            .OrderBy(p => p.Name)
            .Skip(pageSize * pageIndex)
            .Take(pageSize)
            .ToListAsync();

        var items = products.Select(p =>
        {
            var primaryVariant = p.Variants.OrderBy(v => v.Price).FirstOrDefault();
            var primaryImage = p.Images.FirstOrDefault()?.ImageUrl ?? primaryVariant?.ImageUrl;

            return new ProductSearchItemDto
            {
                Id = p.Id,
                Name = p.Name,
                SeoName = p.SeoName,
                Brand = p.Brand?.Name,
                Category = p.Category?.Name,
                Price = primaryVariant?.Price ?? 0,
                Quantity = primaryVariant?.Quantity ?? 0,
                ImageUrl = primaryImage,
                Specifications = p.Specifications,
                SpecsNormalized = p.SpecsNormalized,
                Description = p.Description,
                Status = p.Status
            };
        }).ToList();

        var pagedData = new PaginatedItems<ProductSearchItemDto>(pageIndex, pageSize, totalItems, items);
        return TypedResults.Ok(ApiResponse<PaginatedItems<ProductSearchItemDto>>.Ok(pagedData));
    }

    public static async Task<Results<Ok<ApiResponse<Product>>, NotFound<ApiResponse<Product>>>> GetProductById(
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

    public static async Task<Results<Ok<ApiResponse<Product>>, NotFound<ApiResponse<Product>>>> GetProductBySeoName(
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

    public static async Task<Results<Created<Product>, BadRequest<string>>> CreateProduct(
        CatalogContext context,
        Product product)
    {
        if (string.IsNullOrWhiteSpace(product.Name) || string.IsNullOrWhiteSpace(product.SeoName))
        {
            return TypedResults.BadRequest("Product name and seo_name are required.");
        }

        if (product.Id == Guid.Empty)
        {
            product.Id = Guid.CreateVersion7();
        }

        product.CreatedAt = DateTime.UtcNow;
        product.Status = string.IsNullOrWhiteSpace(product.Status) ? EntityStatus.Active : product.Status;

        context.Products.Add(product);
        await context.SaveChangesAsync();

        return TypedResults.Created($"/api/catalog/products/{product.Id}", product);
    }

    public static async Task<Results<Ok<Product>, NotFound, BadRequest<string>>> UpdateProduct(
        CatalogContext context,
        Guid id,
        Product updateDto)
    {
        var existing = await context.Products.SingleOrDefaultAsync(p => p.Id == id && p.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Name = updateDto.Name;
        existing.SeoName = updateDto.SeoName;
        existing.BrandId = updateDto.BrandId;
        existing.CategoryId = updateDto.CategoryId;
        existing.Specifications = updateDto.Specifications;
        existing.Description = updateDto.Description;
        existing.Status = updateDto.Status;
        existing.UpdatedAt = DateTime.UtcNow;
        existing.UpdatedBy = updateDto.UpdatedBy;

        await context.SaveChangesAsync();
        return TypedResults.Ok(existing);
    }

    public static async Task<Results<NoContent, NotFound>> DeleteProduct(
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
