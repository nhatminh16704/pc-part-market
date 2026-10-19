using System.Text.Json;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace eShop.Catalog.API.Common;

public enum EvictionTargetType
{
    Key,
    Tag
}

public record CacheEvictionNotification(EvictionTargetType Type, string Target, string SenderId);

public class RedisCacheInvalidator : BackgroundService, ICacheInvalidator
{
    private readonly HybridCache _hybridCache;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RedisCacheInvalidator> _logger;
    private readonly string _instanceId = Guid.NewGuid().ToString("N");

    public RedisCacheInvalidator(
        HybridCache hybridCache,
        IServiceProvider serviceProvider,
        ILogger<RedisCacheInvalidator> logger)
    {
        _hybridCache = hybridCache;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    private IConnectionMultiplexer? GetRedis() => _serviceProvider.GetService<IConnectionMultiplexer>();

    public async Task EvictKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        // 1. Evict locally on current instance
        await _hybridCache.RemoveAsync(key, cancellationToken);

        // 2. Broadcast to other instances via Redis Pub/Sub
        await BroadcastEvictionAsync(EvictionTargetType.Key, key);
    }

    public async Task EvictTagAsync(string tag, CancellationToken cancellationToken = default)
    {
        // 1. Evict locally on current instance
        await _hybridCache.RemoveByTagAsync(tag, cancellationToken);

        // 2. Broadcast to other instances via Redis Pub/Sub
        await BroadcastEvictionAsync(EvictionTargetType.Tag, tag);
    }

    private async Task BroadcastEvictionAsync(EvictionTargetType type, string target)
    {
        var redis = GetRedis();
        if (redis is null || !redis.IsConnected)
        {
            return;
        }

        try
        {
            var notification = new CacheEvictionNotification(type, target, _instanceId);
            var payload = JsonSerializer.Serialize(notification);
            var subscriber = redis.GetSubscriber();
            await subscriber.PublishAsync(RedisChannel.Literal(CatalogCachePolicies.InvalidationChannel), payload);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to broadcast cache eviction for {Target}", target);
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Wait until service is running before attempting to subscribe
        await Task.Yield();

        var redis = GetRedis();
        if (redis is null)
        {
            return;
        }

        try
        {
            var subscriber = redis.GetSubscriber();
            await subscriber.SubscribeAsync(
                RedisChannel.Literal(CatalogCachePolicies.InvalidationChannel),
                async (channel, message) =>
                {
                    if (message.IsNullOrEmpty) return;

                    try
                    {
                        var notification = JsonSerializer.Deserialize<CacheEvictionNotification>(message.ToString());
                        if (notification is null || notification.SenderId == _instanceId)
                        {
                            return;
                        }

                        if (notification.Type == EvictionTargetType.Tag)
                        {
                            _logger.LogDebug("Received remote eviction for tag {Tag}", notification.Target);
                            await _hybridCache.RemoveByTagAsync(notification.Target, stoppingToken);
                        }
                        else if (notification.Type == EvictionTargetType.Key)
                        {
                            _logger.LogDebug("Received remote eviction for key {Key}", notification.Target);
                            await _hybridCache.RemoveAsync(notification.Target, stoppingToken);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing cache eviction message: {Message}", message);
                    }
                });

            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            // Graceful shutdown
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis Pub/Sub subscriber encountered an error.");
        }
    }
}
