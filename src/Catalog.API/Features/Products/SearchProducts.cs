using Microsoft.AspNetCore.Http.HttpResults;
using eShop.Shared.Common;

namespace eShop.Catalog.API.Features.Products;

public static class SearchProductsHandler
{
    public static async Task<Ok<ApiResponse<PaginatedItems<ProductSearchItemDto>>>> Handle(
        CatalogContext context,
        ProductSearchRequest req)
    {
        var pageSize = req.PageSize <= 0 ? 10 : req.PageSize;
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
}
