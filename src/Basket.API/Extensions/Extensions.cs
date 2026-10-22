using eShop.Basket.API.Repositories;
using eShop.Basket.API.IntegrationEvents.EventHandling;
using eShop.Basket.API.Services;
using MassTransit;

namespace eShop.Basket.API.Extensions;

public static class Extensions
{
    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.AddDefaultAuthentication();

        builder.AddRedisClient("redis");

        builder.Services.AddSingleton<IBasketRepository, RedisBasketRepository>();

        builder.Services.AddHttpClient<ICatalogApiClient, CatalogApiClient>(client =>
        {
            client.BaseAddress = new("http://catalog-api");
        });

        builder.AddMassTransitEventBus("eventbus", x =>
        {
            x.AddConsumer<OrderStartedIntegrationEventHandler>();
        });
    }
}
