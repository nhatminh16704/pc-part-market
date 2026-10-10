namespace eShop.Catalog.API.Infrastructure;

public class CatalogContext : DbContext
{
    public CatalogContext(DbContextOptions<CatalogContext> options, IConfiguration configuration) : base(options)
    {
    }

    public required DbSet<Brand> Brands { get; set; }
    public required DbSet<Category> Categories { get; set; }
    public required DbSet<Product> Products { get; set; }
    public required DbSet<ProductVariant> ProductVariants { get; set; }
    public required DbSet<ProductImage> ProductImages { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfiguration(new BrandEntityTypeConfiguration());
        builder.ApplyConfiguration(new CategoryEntityTypeConfiguration());
        builder.ApplyConfiguration(new ProductEntityTypeConfiguration());
        builder.ApplyConfiguration(new ProductVariantEntityTypeConfiguration());
        builder.ApplyConfiguration(new ProductImageEntityTypeConfiguration());

        // Add the outbox table to this context
        builder.UseIntegrationEventLogs();
    }
}
