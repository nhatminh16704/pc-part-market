namespace eShop.Catalog.API.Infrastructure.EntityConfigurations;

public class CategoryEntityTypeConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories", t =>
        {
            t.HasCheckConstraint("ck_categories_status", "status IN ('ACTIVE', 'INACTIVE', 'DELETED')");
        });

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("uuidv7()");

        builder.Property(c => c.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(c => c.SeoName)
            .HasColumnName("seo_name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(c => c.Description)
            .HasColumnName("description")
            .HasColumnType("text");

        builder.Property(c => c.ParentId)
            .HasColumnName("parent_id");

        builder.Property(c => c.Status)
            .HasColumnName("status")
            .HasMaxLength(15)
            .HasDefaultValue(EntityStatus.Active)
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        builder.HasOne(c => c.Parent)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.ParentId)
            .HasDatabaseName("idx_categories_parent_id");

        builder.HasIndex(c => c.Name)
            .HasDatabaseName("uk_categories_name")
            .IsUnique()
            .HasFilter("status <> 'DELETED'");

        builder.HasIndex(c => c.SeoName)
            .HasDatabaseName("uk_categories_seo_name")
            .IsUnique()
            .HasFilter("status <> 'DELETED'");
    }
}
