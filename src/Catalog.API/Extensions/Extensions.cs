using eShop.Catalog.API.Common;
using eShop.Catalog.API.Services;
using FluentValidation;
using MassTransit;

public static class Extensions
{
    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {
        // Avoid loading full database config and migrations if startup
        // is being invoked from build-time OpenAPI generation
        if (builder.Environment.IsBuild())
        {
            builder.Services.AddDbContext<CatalogContext>();
#pragma warning disable EXTEXP0018
            builder.Services.AddHybridCache();
#pragma warning restore EXTEXP0018
            builder.Services.AddSingleton<ICacheInvalidator, RedisCacheInvalidator>();
            return;
        }

        builder.AddNpgsqlDbContext<CatalogContext>("catalogdb", configureDbContextOptions: dbContextOptionsBuilder =>
        {
            dbContextOptionsBuilder.UseNpgsql(builder =>
            {
                builder.UseVector();
            });
            dbContextOptionsBuilder.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        });

        // REVIEW: This is done for development ease but shouldn't be here in production
        builder.Services.AddMigration<CatalogContext, CatalogContextSeed>();

        // Add the integration services that consume the DbContext
        builder.Services.AddTransient<IIntegrationEventLogService, IntegrationEventLogService<CatalogContext>>();

        builder.Services.AddTransient<ICatalogIntegrationEventService, CatalogIntegrationEventService>();

        builder.AddMassTransitEventBus("eventbus", x =>
        {
            x.AddConsumer<OrderStatusChangedToAwaitingValidationIntegrationEventHandler>();
            x.AddConsumer<OrderStatusChangedToPaidIntegrationEventHandler>();
        });

        builder.Services.AddOptions<CatalogOptions>()
            .BindConfiguration(nameof(CatalogOptions));

        if (builder.Configuration["OllamaEnabled"] is string ollamaEnabled && bool.Parse(ollamaEnabled))
        {
            builder.AddOllamaApiClient("embedding")
                .AddEmbeddingGenerator();
        }
        else if (!string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("textEmbeddingModel")))
        {
            builder.AddOpenAIClientFromConfiguration("textEmbeddingModel")
                .AddEmbeddingGenerator();
        }

        builder.Services.AddScoped<ICatalogAI, CatalogAI>();
        builder.Services.AddValidatorsFromAssemblyContaining<Program>();

        builder.AddRedisDistributedCache("redis");

#pragma warning disable EXTEXP0018
        builder.Services.AddHybridCache(options =>
        {
            options.DefaultEntryOptions = new Microsoft.Extensions.Caching.Hybrid.HybridCacheEntryOptions
            {
                LocalCacheExpiration = TimeSpan.FromMinutes(5),
                Expiration = TimeSpan.FromMinutes(30)
            };
        });
#pragma warning restore EXTEXP0018

        builder.Services.AddSingleton<RedisCacheInvalidator>();
        builder.Services.AddSingleton<ICacheInvalidator>(sp => sp.GetRequiredService<RedisCacheInvalidator>());
        builder.Services.AddHostedService(sp => sp.GetRequiredService<RedisCacheInvalidator>());
    }
}
