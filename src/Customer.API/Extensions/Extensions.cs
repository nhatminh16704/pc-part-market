using eShop.Customer.API.Infrastructure;
using eShop.Customer.API.IntegrationEvents.EventHandling;
using eShop.ServiceDefaults;
using FluentValidation;
using MassTransit;

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

        builder.AddMassTransitEventBus("eventbus", x =>
        {
            x.AddEntityFrameworkOutbox<CustomerContext>(o =>
            {
                o.UsePostgres();
                o.UseBusOutbox();
            });

            x.AddConsumer<UserRegisteredIntegrationEventConsumer>();

            x.AddConfigureEndpointsCallback((context, name, cfg) =>
            {
                cfg.UseEntityFrameworkOutbox<CustomerContext>(context);
            });
        });

        builder.Services.AddValidatorsFromAssemblyContaining<Program>();
        builder.Services.AddOpenApi();
    }
}
