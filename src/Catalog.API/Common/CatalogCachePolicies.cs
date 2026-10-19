using Microsoft.Extensions.Caching.Hybrid;

namespace eShop.Catalog.API.Common;

public static class CatalogCachePolicies
{
    // Redis Pub/Sub Channel for Multi-Node L1 Eviction
    public const string InvalidationChannel = "catalog:cache:evict";

    // Tags
    public const string CategoriesTag = "categories";
    public const string BrandsTag = "brands";
    public const string ProductsTag = "products";
    public const string ProductsListTag = "products-list";
    public const string ProductsSearchTag = "products-search";
    public static string ProductTag(Guid id) => $"product:{id}";

    // Keys - Metadata
    public const string AllCategoriesKey = "categories:all";
    public const string AllBrandsKey = "brands:all";
    public static string CategoryKey(Guid id) => $"category:{id}";
    public static string BrandKey(Guid id) => $"brand:{id}";

    // Keys - Products
    public static string ProductKey(Guid id) => $"product:id:{id}";
    public static string ProductSeoKey(string seoName) => $"product:seo:{seoName.ToLowerInvariant()}";
    public static string ProductListKey(int pageIndex, int pageSize, Guid? brandId, Guid? categoryId, string? name)
        => $"products:p:{pageIndex}:s:{pageSize}:b:{brandId?.ToString() ?? "all"}:c:{categoryId?.ToString() ?? "all"}:n:{name?.Trim().ToLowerInvariant() ?? "all"}";
    public static string ProductSearchKey(string criteriaHash) => $"products:search:{criteriaHash}";

    /// <summary>
    /// Cache options for static metadata (Categories & Brands):
    /// - L1 (In-Memory RAM): 30 minutes
    /// - L2 (Redis): 24 hours
    /// </summary>
    public static readonly HybridCacheEntryOptions StaticMetadata = new()
    {
        LocalCacheExpiration = TimeSpan.FromMinutes(30),
        Expiration = TimeSpan.FromHours(24)
    };

    /// <summary>
    /// Cache options for single product detail (with 4 Includes: Brand, Category, Variants, Images):
    /// - L1 (In-Memory RAM): 5 minutes
    /// - L2 (Redis): 1 hour
    /// </summary>
    public static readonly HybridCacheEntryOptions ProductDetail = new()
    {
        LocalCacheExpiration = TimeSpan.FromMinutes(5),
        Expiration = TimeSpan.FromHours(1)
    };

    /// <summary>
    /// Cache options for product listing & search queries:
    /// - L1 (In-Memory RAM): 2 minutes
    /// - L2 (Redis): 15 minutes
    /// </summary>
    public static readonly HybridCacheEntryOptions ProductList = new()
    {
        LocalCacheExpiration = TimeSpan.FromMinutes(2),
        Expiration = TimeSpan.FromMinutes(15)
    };
}
