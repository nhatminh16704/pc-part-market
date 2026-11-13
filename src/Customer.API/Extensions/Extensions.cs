using eShop.Customer.API.Infrastructure;
using eShop.ServiceDefaults;
using FluentValidation;

namespace eShop.Customer.API.Extensions;

public static class Extensions
{
    public const string StaffOrAdminPolicy = "StaffOrAdmin";

    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.AddDefaultAuthentication();

        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy(StaffOrAdminPolicy, policy =>
                policy.RequireClaim("user_type", "STAFF", "ADMIN"));
        });

        builder.AddNpgsqlDbContext<CustomerContext>("customerdb");
        builder.Services.AddMigration<CustomerContext>();

        builder.Services.AddValidatorsFromAssemblyContaining<Program>();
        builder.Services.AddOpenApi();
    }
}
