namespace eShop.Catalog.API.Infrastructure.EntityConfigurations;

public class ProductImageEntityTypeConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("product_images");

        builder.HasKey(pi => pi.Id);

        builder.Property(pi => pi.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("uuidv7()");

        builder.Property(pi => pi.ProductId)
            .HasColumnName("product_id")
            .IsRequired();

        builder.Property(pi => pi.ImageUrl)
            .HasColumnName("image_url")
            .HasMaxLength(2048)
            .IsRequired();

        builder.Property(pi => pi.IsMain)
            .HasColumnName("is_main")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(pi => pi.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        builder.HasOne(pi => pi.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(pi => new { pi.ProductId, pi.ImageUrl })
            .IsUnique();

        builder.HasIndex(pi => pi.ProductId)
            .HasDatabaseName("uk_product_images_main")
            .IsUnique()
            .HasFilter("is_main = true");
    }
}
