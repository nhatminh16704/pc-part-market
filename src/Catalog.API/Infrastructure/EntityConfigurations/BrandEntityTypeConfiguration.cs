namespace eShop.Catalog.API.Infrastructure.EntityConfigurations;

public class BrandEntityTypeConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("brands", t =>
        {
            t.HasCheckConstraint("ck_brands_status", "status IN ('ACTIVE', 'INACTIVE', 'DELETED')");
        });

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("uuidv7()");

        builder.Property(b => b.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(b => b.SeoName)
            .HasColumnName("seo_name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(b => b.Description)
            .HasColumnName("description")
            .HasColumnType("text");

        builder.Property(b => b.ImageUrl)
            .HasColumnName("image_url")
            .HasMaxLength(2048);

        builder.Property(b => b.Status)
            .HasColumnName("status")
            .HasMaxLength(15)
            .HasDefaultValue(EntityStatus.Active)
            .IsRequired();

        builder.Property(b => b.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        builder.HasIndex(b => b.Name)
            .HasDatabaseName("uk_brands_name")
            .IsUnique()
            .HasFilter("status <> 'DELETED'");

        builder.HasIndex(b => b.SeoName)
            .HasDatabaseName("uk_brands_seo_name")
            .IsUnique()
            .HasFilter("status <> 'DELETED'");
    }
}
