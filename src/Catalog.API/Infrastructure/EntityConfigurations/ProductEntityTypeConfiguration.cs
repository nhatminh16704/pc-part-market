namespace eShop.Catalog.API.Infrastructure.EntityConfigurations;

public class ProductEntityTypeConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products", t =>
        {
            t.HasCheckConstraint("ck_products_status", "status IN ('ACTIVE', 'INACTIVE', 'DELETED')");
        });

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("uuidv7()");

        builder.Property(p => p.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(p => p.SeoName)
            .HasColumnName("seo_name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(p => p.BrandId)
            .HasColumnName("brand_id");

        builder.Property(p => p.CategoryId)
            .HasColumnName("category_id")
            .IsRequired();

        builder.Property(p => p.Specifications)
            .HasColumnName("specifications")
            .HasColumnType("jsonb");

        builder.Property(p => p.Description)
            .HasColumnName("description")
            .HasColumnType("text");

        builder.Property(p => p.Status)
            .HasColumnName("status")
            .HasMaxLength(15)
            .HasDefaultValue(EntityStatus.Active)
            .IsRequired();

        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        builder.Property(p => p.CreatedBy)
            .HasColumnName("created_by")
            .IsRequired();

        builder.Property(p => p.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone");

        builder.Property(p => p.UpdatedBy)
            .HasColumnName("updated_by");

        builder.HasOne(p => p.Brand)
            .WithMany(b => b.Products)
            .HasForeignKey(p => p.BrandId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.SeoName)
            .HasDatabaseName("uk_products_seo_name")
            .IsUnique()
            .HasFilter("status <> 'DELETED'");

        builder.HasIndex(p => p.BrandId)
            .HasDatabaseName("idx_products_brand_id");

        builder.HasIndex(p => p.CategoryId)
            .HasDatabaseName("idx_products_category_id");
    }
}
