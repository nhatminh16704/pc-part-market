using eShop.Basket.API.Repositories;
using eShop.Basket.API.IntegrationEvents.EventHandling;
using eShop.Basket.API.Services;
using Grpc.Net.Client.Web;
using MassTransit;

namespace eShop.Basket.API.Extensions;

public static class Extensions
{
    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.AddDefaultAuthentication();

        builder.AddRedisClient("redis");

        builder.Services.AddSingleton<IBasketRepository, RedisBasketRepository>();

        builder.Services.AddGrpcClient<eShop.Catalog.API.Grpc.Catalog.CatalogClient>(client =>
        {
            client.Address = new("http://catalog-api");
        }).ConfigurePrimaryHttpMessageHandler(() => new GrpcWebHandler(new HttpClientHandler()));

        builder.Services.AddScoped<ICatalogApiClient, CatalogGrpcClient>();

        builder.AddMassTransitEventBus("eventbus", x =>
        {
            x.AddConsumer<OrderStartedIntegrationEventHandler>();
        });
    }
}
