using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Microsoft.Extensions.Hosting;

public static class MassTransitExtensions
{
    public static IHostApplicationBuilder AddMassTransitEventBus(
        this IHostApplicationBuilder builder,
        string connectionName = "eventbus",
        Action<IBusRegistrationConfigurator>? configure = null)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.Services.AddMassTransit(x =>
        {
            x.SetKebabCaseEndpointNameFormatter();

            configure?.Invoke(x);

            x.UsingRabbitMq((context, cfg) =>
            {
                var connectionString = builder.Configuration.GetConnectionString(connectionName)
                                       ?? builder.Configuration.GetConnectionString("EventBus")
                                       ?? builder.Configuration["EventBus:ConnectionString"];

                if (!string.IsNullOrWhiteSpace(connectionString))
                {
                    cfg.Host(connectionString);
                }

                cfg.UseMessageRetry(r => r.Exponential(
                    retryLimit: 5,
                    minInterval: TimeSpan.FromSeconds(1),
                    maxInterval: TimeSpan.FromSeconds(30),
                    intervalDelta: TimeSpan.FromSeconds(2)
                ));

                cfg.ConfigureEndpoints(context);
            });
        });

        return builder;
    }
}
