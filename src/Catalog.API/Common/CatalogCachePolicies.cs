using Microsoft.Extensions.Caching.Hybrid;

namespace eShop.Catalog.API.Common;

public static class CatalogCachePolicies
{
    // Tags
    public const string CategoriesTag = "categories";
    public const string BrandsTag = "brands";

    // Keys
    public const string AllCategoriesKey = "categories:all";
    public const string AllBrandsKey = "brands:all";

    public static string CategoryKey(Guid id) => $"category:{id}";
    public static string BrandKey(Guid id) => $"brand:{id}";

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
}
