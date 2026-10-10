using eShop.PaymentProcessor.IntegrationEvents.EventHandling;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.AddMassTransitEventBus("EventBus", x =>
{
    x.AddConsumer<OrderStatusChangedToStockConfirmedIntegrationEventHandler>();
});

builder.Services.AddOptions<PaymentOptions>()
    .BindConfiguration(nameof(PaymentOptions));

var app = builder.Build();

app.MapDefaultEndpoints();

await app.RunAsync();
