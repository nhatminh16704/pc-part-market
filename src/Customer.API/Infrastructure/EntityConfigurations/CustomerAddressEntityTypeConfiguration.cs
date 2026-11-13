using eShop.Customer.API.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace eShop.Customer.API.Infrastructure.EntityConfigurations;

public class CustomerAddressEntityTypeConfiguration : IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<CustomerAddress> builder)
    {
        builder.ToTable("customer_addresses");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("uuidv7()");

        builder.Property(a => a.CustomerId)
            .HasColumnName("customer_id")
            .IsRequired();

        builder.Property(a => a.ReceiverName)
            .HasColumnName("receiver_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.ReceiverPhone)
            .HasColumnName("receiver_phone")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(a => a.Province)
            .HasColumnName("province")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.District)
            .HasColumnName("district")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.Ward)
            .HasColumnName("ward")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.StreetAddress)
            .HasColumnName("street_address")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(a => a.PostalCode)
            .HasColumnName("postal_code")
            .HasMaxLength(20);

        builder.Property(a => a.IsDefault)
            .HasColumnName("is_default")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(a => a.Label)
            .HasColumnName("label")
            .HasMaxLength(50);

        builder.Property(a => a.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        builder.Property(a => a.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone");

        builder.HasOne(a => a.Customer)
            .WithMany(c => c.Addresses)
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => a.CustomerId)
            .HasDatabaseName("ix_customer_addresses_customer_id");

        builder.HasIndex(a => a.CustomerId)
            .IsUnique()
            .HasFilter("is_default = true")
            .HasDatabaseName("ix_customer_addresses_default_per_customer");
    }
}
