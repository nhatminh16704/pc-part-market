using eShop.Customer.API.Infrastructure.EntityConfigurations;
using eShop.Customer.API.Model;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Infrastructure;

public class CustomerContext(DbContextOptions<CustomerContext> options) : DbContext(options)
{
    public required DbSet<Model.Customer> Customers { get; set; }
    public required DbSet<CustomerAddress> CustomerAddresses { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfiguration(new CustomerEntityTypeConfiguration());
        builder.ApplyConfiguration(new CustomerAddressEntityTypeConfiguration());
    }
}
