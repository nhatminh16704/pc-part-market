namespace eShop.Catalog.API.Infrastructure.EntityConfigurations;

public class ProductVariantEntityTypeConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("product_variants", t =>
        {
            t.HasCheckConstraint("ck_product_variants_price", "price >= 0");
            t.HasCheckConstraint("ck_product_variants_quantity", "quantity >= 0");
            t.HasCheckConstraint("ck_product_variants_warranty_months", "warranty_months > 0");
            t.HasCheckConstraint("ck_product_variants_status", "status IN ('ACTIVE', 'INACTIVE', 'DELETED')");
        });

        builder.HasKey(pv => pv.Id);

        builder.Property(pv => pv.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("uuidv7()");

        builder.Property(pv => pv.ProductId)
            .HasColumnName("product_id")
            .IsRequired();

        builder.Property(pv => pv.Price)
            .HasColumnName("price")
            .HasColumnType("bigint")
            .IsRequired();

        builder.Property(pv => pv.Quantity)
            .HasColumnName("quantity")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(pv => pv.Sku)
            .HasColumnName("sku")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(pv => pv.Model)
            .HasColumnName("model")
            .HasMaxLength(100);

        builder.Property(pv => pv.ImageUrl)
            .HasColumnName("image_url")
            .HasMaxLength(2048);

        builder.Property(pv => pv.Description)
            .HasColumnName("description")
            .HasColumnType("text");

        builder.Property(pv => pv.WarrantyMonths)
            .HasColumnName("warranty_months")
            .IsRequired();

        builder.Property(pv => pv.Barcode)
            .HasColumnName("barcode")
            .HasMaxLength(100);

        builder.Property(pv => pv.ReleaseAt)
            .HasColumnName("release_at")
            .HasColumnType("date");

        builder.Property(pv => pv.Status)
            .HasColumnName("status")
            .HasMaxLength(15)
            .HasDefaultValue(EntityStatus.Active)
            .IsRequired();

        builder.Property(pv => pv.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        builder.Property(pv => pv.CreatedBy)
            .HasColumnName("created_by")
            .IsRequired();

        builder.Property(pv => pv.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone");

        builder.Property(pv => pv.UpdatedBy)
            .HasColumnName("updated_by");

        builder.HasOne(pv => pv.Product)
            .WithMany(p => p.Variants)
            .HasForeignKey(pv => pv.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(pv => pv.ProductId)
            .HasDatabaseName("idx_product_variants_product_id");

        builder.HasIndex(pv => pv.Sku)
            .HasDatabaseName("uk_product_variants_sku")
            .IsUnique()
            .HasFilter("status <> 'DELETED'");

        builder.HasIndex(pv => pv.Barcode)
            .HasDatabaseName("uk_product_variants_barcode")
            .IsUnique()
            .HasFilter("status <> 'DELETED'");
    }
}
