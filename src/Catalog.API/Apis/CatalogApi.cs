using System.ComponentModel;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace eShop.Catalog.API;

public static class CatalogApi
{
    public static IEndpointRouteBuilder MapCatalogApi(this IEndpointRouteBuilder app)
    {
        var vApi = app.NewVersionedApi("Catalog");
        var api = vApi.MapGroup("api/catalog").HasApiVersion(1, 0).HasApiVersion(2, 0);

        // ==========================================
        // PRODUCTS ENDPOINTS (New Schema)
        // ==========================================
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

        // ==========================================
        // VARIANTS ENDPOINTS (New Schema)
        // ==========================================
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

        // ==========================================
        // BRANDS ENDPOINTS (New Schema)
        // ==========================================
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

        // ==========================================
        // CATEGORIES ENDPOINTS (New Schema)
        // ==========================================
        api.MapGet("/categories", GetAllCategories)
            .WithName("ListCategories")
            .WithSummary("List categories")
            .WithDescription("Get all active categories.")
            .WithTags("Categories");

        api.MapGet("/categories/{id:guid}", GetCategoryById)
            .WithName("GetCategoryById")
            .WithSummary("Get category by ID")
            .WithTags("Categories");

        api.MapPost("/categories", CreateCategory)
            .WithName("CreateCategory")
            .WithSummary("Create category")
            .WithTags("Categories");

        api.MapPut("/categories/{id:guid}", UpdateCategory)
            .WithName("UpdateCategory")
            .WithSummary("Update category")
            .WithTags("Categories");

        api.MapDelete("/categories/{id:guid}", DeleteCategory)
            .WithName("DeleteCategory")
            .WithSummary("Soft-delete category")
            .WithTags("Categories");

        // ==========================================
        // IMAGES ENDPOINT
        // ==========================================
        api.MapGet("/images/{fileName}", GetImageByFileName)
            .WithName("GetImage")
            .WithSummary("Get image file")
            .WithTags("Images");

        // ==========================================
        // BACKWARD-COMPATIBILITY ENDPOINTS (For WebApp UI)
        // ==========================================
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

    // -------------------------------------------------------------
    // Product Handlers
    // -------------------------------------------------------------
    public static async Task<Ok<PaginatedItems<Product>>> GetAllProducts(
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

        return TypedResults.Ok(new PaginatedItems<Product>(pageIndex, pageSize, totalItems, itemsOnPage));
    }

    public static async Task<Results<Ok<Product>, NotFound>> GetProductById(
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

        return product is null ? TypedResults.NotFound() : TypedResults.Ok(product);
    }

    public static async Task<Results<Ok<Product>, NotFound>> GetProductBySeoName(
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

        return product is null ? TypedResults.NotFound() : TypedResults.Ok(product);
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

    // -------------------------------------------------------------
    // Variant Handlers
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // Brand Handlers
    // -------------------------------------------------------------
    public static async Task<Ok<List<Brand>>> GetAllBrands(CatalogContext context)
    {
        var brands = await context.Brands
            .AsNoTracking()
            .Where(b => b.Status != EntityStatus.Deleted)
            .OrderBy(b => b.Name)
            .ToListAsync();

        return TypedResults.Ok(brands);
    }

    public static async Task<Results<Ok<Brand>, NotFound>> GetBrandById(CatalogContext context, Guid id)
    {
        var brand = await context.Brands
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id && b.Status != EntityStatus.Deleted);

        return brand is null ? TypedResults.NotFound() : TypedResults.Ok(brand);
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

    // -------------------------------------------------------------
    // Category Handlers
    // -------------------------------------------------------------
    public static async Task<Ok<List<Category>>> GetAllCategories(CatalogContext context)
    {
        var categories = await context.Categories
            .AsNoTracking()
            .Where(c => c.Status != EntityStatus.Deleted)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return TypedResults.Ok(categories);
    }

    public static async Task<Results<Ok<Category>, NotFound>> GetCategoryById(CatalogContext context, Guid id)
    {
        var category = await context.Categories
            .AsNoTracking()
            .Include(c => c.SubCategories.Where(sc => sc.Status != EntityStatus.Deleted))
            .SingleOrDefaultAsync(c => c.Id == id && c.Status != EntityStatus.Deleted);

        return category is null ? TypedResults.NotFound() : TypedResults.Ok(category);
    }

    public static async Task<Results<Created<Category>, BadRequest<string>>> CreateCategory(CatalogContext context, Category category)
    {
        if (string.IsNullOrWhiteSpace(category.Name) || string.IsNullOrWhiteSpace(category.SeoName))
        {
            return TypedResults.BadRequest("Category name and seo_name are required.");
        }

        category.Id = category.Id == Guid.Empty ? Guid.CreateVersion7() : category.Id;
        category.CreatedAt = DateTime.UtcNow;
        category.Status = string.IsNullOrWhiteSpace(category.Status) ? EntityStatus.Active : category.Status;

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        return TypedResults.Created($"/api/catalog/categories/{category.Id}", category);
    }

    public static async Task<Results<Ok<Category>, NotFound>> UpdateCategory(CatalogContext context, Guid id, Category updateDto)
    {
        var existing = await context.Categories.SingleOrDefaultAsync(c => c.Id == id && c.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Name = updateDto.Name;
        existing.SeoName = updateDto.SeoName;
        existing.Description = updateDto.Description;
        existing.ParentId = updateDto.ParentId;
        existing.Status = updateDto.Status;

        await context.SaveChangesAsync();
        return TypedResults.Ok(existing);
    }

    public static async Task<Results<NoContent, NotFound>> DeleteCategory(CatalogContext context, Guid id)
    {
        var existing = await context.Categories.SingleOrDefaultAsync(c => c.Id == id && c.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Status = EntityStatus.Deleted;
        await context.SaveChangesAsync();

        return TypedResults.NoContent();
    }

    // -------------------------------------------------------------
    // Image File Handler
    // -------------------------------------------------------------
    public static IResult GetImageByFileName(
        IWebHostEnvironment environment,
        string fileName)
    {
        var path = Path.Combine(environment.ContentRootPath, "Pics", fileName);
        if (!File.Exists(path))
        {
            return Results.NotFound();
        }

        string ext = Path.GetExtension(fileName).ToLowerInvariant();
        string mimeType = ext switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            ".svg" => "image/svg+xml",
            _ => "application/octet-stream"
        };

        return Results.File(path, mimeType, lastModified: File.GetLastWriteTimeUtc(path));
    }

    // -------------------------------------------------------------
    // Compatibility Layer for WebApp UI
    // -------------------------------------------------------------
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
