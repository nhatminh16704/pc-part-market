using eShop.Customer.API.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace eShop.Customer.API.Infrastructure.EntityConfigurations;

public class CustomerEntityTypeConfiguration : IEntityTypeConfiguration<Model.Customer>
{
    public void Configure(EntityTypeBuilder<Model.Customer> builder)
    {
        builder.ToTable("customers", t =>
        {
            t.HasCheckConstraint(
                "ck_customers_gender",
                "gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER')");
        });

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(c => c.Email)
            .HasColumnName("email")
            .HasMaxLength(256)
            .IsRequired();

        builder.HasIndex(c => c.Email)
            .IsUnique()
            .HasDatabaseName("ix_customers_email");

        builder.Property(c => c.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100);

        builder.Property(c => c.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100);

        builder.Property(c => c.PhoneNumber)
            .HasColumnName("phone_number")
            .HasMaxLength(20);

        builder.Property(c => c.AvatarUrl)
            .HasColumnName("avatar_url")
            .HasMaxLength(500);

        builder.Property(c => c.Gender)
            .HasColumnName("gender")
            .HasMaxLength(10);

        builder.Property(c => c.DateOfBirth)
            .HasColumnName("date_of_birth")
            .HasColumnType("date");

        builder.Property(c => c.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        builder.Property(c => c.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone");
    }
}

