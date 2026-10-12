using System.Text.Json;
using System.Text.RegularExpressions;

namespace eShop.Catalog.API.Infrastructure;

public partial class CatalogContextSeed(
    IWebHostEnvironment env,
    IOptions<CatalogOptions> settings,
    ILogger<CatalogContextSeed> logger) : IDbSeeder<CatalogContext>
{
    private static readonly Guid DefaultAdminId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public async Task SeedAsync(CatalogContext context)
    {
        _ = settings.Value;
        var contentRootPath = env.ContentRootPath;

        // Workaround from https://github.com/npgsql/efcore.pg/issues/292#issuecomment-388608426
        context.Database.OpenConnection();
        ((NpgsqlConnection)context.Database.GetDbConnection()).ReloadTypes();

        if (!await context.Products.AnyAsync())
        {
            var sqlFile = Path.Combine(contentRootPath, "insert_seed_data.sql");
            if (!File.Exists(sqlFile))
            {
                sqlFile = Path.Combine(AppContext.BaseDirectory, "insert_seed_data.sql");
            }

            if (File.Exists(sqlFile))
            {
                logger.LogInformation("Seeding PC part catalog from {SqlFile}", sqlFile);
                var sql = await File.ReadAllTextAsync(sqlFile);
                await context.Database.ExecuteSqlRawAsync(sql);
                logger.LogInformation("Successfully seeded PC part catalog.");

                var normFile = Path.Combine(contentRootPath, "specs_normalized.sql");
                if (!File.Exists(normFile))
                {
                    normFile = Path.Combine(AppContext.BaseDirectory, "specs_normalized.sql");
                }
                if (File.Exists(normFile))
                {
                    logger.LogInformation("Applying normalized specs from {NormFile}", normFile);
                    var normSql = await File.ReadAllTextAsync(normFile);
                    await context.Database.ExecuteSqlRawAsync(normSql);
                    logger.LogInformation("Successfully applied normalized specs.");
                }

                return;
            }

            var sourcePath = Path.Combine(contentRootPath, "Setup", "catalog.json");
            var sourceJson = await File.ReadAllTextAsync(sourcePath);
            var sourceItems = JsonSerializer.Deserialize<CatalogSourceEntry[]>(sourceJson) ?? Array.Empty<CatalogSourceEntry>();

            context.Brands.RemoveRange(context.Brands);
            var brandMap = new Dictionary<string, Brand>(StringComparer.OrdinalIgnoreCase);
            var distinctBrands = sourceItems.Select(x => x.Brand).Where(b => !string.IsNullOrWhiteSpace(b)).Distinct()!;
            foreach (var brandName in distinctBrands)
            {
                var brand = new Brand
                {
                    Id = Guid.CreateVersion7(),
                    Name = brandName!,
                    SeoName = ToSeoName(brandName!),
                    Description = $"Official brand {brandName}",
                    Status = EntityStatus.Active,
                    CreatedAt = DateTime.UtcNow
                };
                brandMap[brandName!] = brand;
                context.Brands.Add(brand);
            }
            logger.LogInformation("Seeding {NumBrands} brands", brandMap.Count);

            context.Categories.RemoveRange(context.Categories);
            var categoryMap = new Dictionary<string, Category>(StringComparer.OrdinalIgnoreCase);
            var distinctCategories = sourceItems.Select(x => x.Type).Where(t => !string.IsNullOrWhiteSpace(t)).Distinct()!;
            foreach (var typeName in distinctCategories)
            {
                var category = new Category
                {
                    Id = Guid.CreateVersion7(),
                    Name = typeName!,
                    SeoName = ToSeoName(typeName!),
                    Description = $"Category {typeName}",
                    Status = EntityStatus.Active,
                    CreatedAt = DateTime.UtcNow
                };
                categoryMap[typeName!] = category;
                context.Categories.Add(category);
            }
            logger.LogInformation("Seeding {NumCategories} categories", categoryMap.Count);

            await context.SaveChangesAsync();

            var products = new List<Product>();
            var variants = new List<ProductVariant>();
            var images = new List<ProductImage>();

            foreach (var source in sourceItems.Where(s => !string.IsNullOrWhiteSpace(s.Name) && s.Brand != null && s.Type != null))
            {
                var brand = brandMap[source.Brand!];
                var category = categoryMap[source.Type!];

                var product = new Product
                {
                    Id = Guid.CreateVersion7(),
                    Name = source.Name!,
                    SeoName = ToSeoName($"{source.Name}-{source.Id}"),
                    BrandId = brand.Id,
                    CategoryId = category.Id,
                    Description = source.Description,
                    Specifications = "{}",
                    Status = EntityStatus.Active,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = DefaultAdminId
                };
                products.Add(product);

                var variant = new ProductVariant
                {
                    Id = Guid.CreateVersion7(),
                    ProductId = product.Id,
                    Price = (long)(source.Price * 100),
                    Quantity = 100,
                    Sku = $"SKU-{source.Id:D5}-01",
                    Model = source.Name,
                    ImageUrl = $"{source.Id}.webp",
                    Description = source.Description,
                    WarrantyMonths = 12,
                    Barcode = $"893{source.Id:D9}",
                    ReleaseAt = DateOnly.FromDateTime(DateTime.UtcNow),
                    Status = EntityStatus.Active,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = DefaultAdminId
                };
                variants.Add(variant);

                var image = new ProductImage
                {
                    Id = Guid.CreateVersion7(),
                    ProductId = product.Id,
                    ImageUrl = $"{source.Id}.webp",
                    IsMain = true,
                    CreatedAt = DateTime.UtcNow
                };
                images.Add(image);
            }

            await context.Products.AddRangeAsync(products);
            await context.ProductVariants.AddRangeAsync(variants);
            await context.ProductImages.AddRangeAsync(images);

            logger.LogInformation("Seeding {NumProducts} products, {NumVariants} variants, {NumImages} images",
                products.Count, variants.Count, images.Count);

            await context.SaveChangesAsync();
        }
    }

    private static string ToSeoName(string input)
    {
        var cleaned = Regex.Replace(input.ToLowerInvariant(), @"[^a-z0-9\-]+", "-");
        return cleaned.Trim('-');
    }

    private class CatalogSourceEntry
    {
        public int Id { get; set; }
        public string? Type { get; set; }
        public string? Brand { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
    }
}
