namespace eShop.Ordering.Infrastructure.EntityConfigurations;

class OrderEntityTypeConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> orderConfiguration)
    {
        orderConfiguration.ToTable("orders");

        orderConfiguration.Ignore(b => b.DomainEvents);

        orderConfiguration.Property(o => o.Id)
            .UseHiLo("orderseq");

        orderConfiguration.Property(o => o.CustomerId)
            .IsRequired();

        orderConfiguration.HasIndex(o => o.CustomerId)
            .HasDatabaseName("ix_orders_customer_id");

        orderConfiguration.OwnsOne(o => o.Address, address =>
        {
            address.Property(a => a.ReceiverName).HasMaxLength(100).IsRequired();
            address.Property(a => a.ReceiverPhone).HasMaxLength(20).IsRequired();
            address.Property(a => a.Province).HasMaxLength(100).IsRequired();
            address.Property(a => a.District).HasMaxLength(100).IsRequired();
            address.Property(a => a.Ward).HasMaxLength(100).IsRequired();
            address.Property(a => a.StreetAddress).HasMaxLength(255).IsRequired();
            address.Property(a => a.PostalCode).HasMaxLength(20);
        });

        orderConfiguration
            .Property(o => o.OrderStatus)
            .HasConversion<string>()
            .HasMaxLength(30);

        orderConfiguration
            .Property(o => o.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(30);

        orderConfiguration
            .Property(o => o.PaymentStatus)
            .HasConversion<string>()
            .HasMaxLength(30);
    }
}
