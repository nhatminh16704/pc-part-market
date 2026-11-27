namespace eShop.Ordering.Infrastructure.EntityConfigurations;

class OrderItemEntityTypeConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> orderItemConfiguration)
    {
        orderItemConfiguration.ToTable("orderItems");

        orderItemConfiguration.Ignore(b => b.DomainEvents);

        orderItemConfiguration.Property(o => o.Id)
            .UseHiLo("orderitemseq");

        orderItemConfiguration.Property<int>("OrderId");

        orderItemConfiguration.Property(o => o.Sku)
            .HasMaxLength(100)
            .IsRequired();

        orderItemConfiguration.Property(o => o.ProductName)
            .HasMaxLength(255)
            .IsRequired();
    }
}
