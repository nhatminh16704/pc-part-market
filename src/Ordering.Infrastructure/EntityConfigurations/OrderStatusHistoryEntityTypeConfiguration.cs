namespace eShop.Ordering.Infrastructure.EntityConfigurations;

class OrderStatusHistoryEntityTypeConfiguration : IEntityTypeConfiguration<OrderStatusHistory>
{
    public void Configure(EntityTypeBuilder<OrderStatusHistory> builder)
    {
        builder.ToTable("orderStatusHistories");

        builder.Ignore(h => h.DomainEvents);

        builder.Property(h => h.Id)
            .UseHiLo("orderstatushistoryseq");

        builder.Property<int>("OrderId");

        builder.Property(h => h.FromStatus)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(h => h.ToStatus)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(h => h.Note)
            .HasMaxLength(500);

        builder.Property(h => h.ChangedBy)
            .HasMaxLength(100)
            .IsRequired();
    }
}

