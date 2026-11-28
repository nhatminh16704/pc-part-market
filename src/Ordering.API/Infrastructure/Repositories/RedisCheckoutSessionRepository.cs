#nullable enable

using System.Text.Json;
using StackExchange.Redis;

namespace eShop.Ordering.API.Infrastructure.Repositories;

public class RedisCheckoutSessionRepository(
    ILogger<RedisCheckoutSessionRepository> logger,
    IConnectionMultiplexer redis) : ICheckoutSessionRepository
{
    public static readonly TimeSpan SessionTtl = TimeSpan.FromMinutes(15);
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IDatabase _database = redis.GetDatabase();

    private static RedisKey GetKey(Guid sessionId) => $"checkout:{sessionId:D}";

    public async Task<CheckoutSession?> GetAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        using var data = await _database.StringGetLeaseAsync(GetKey(sessionId));
        if (data is null || data.Length == 0)
        {
            return null;
        }

        return JsonSerializer.Deserialize<CheckoutSession>(data.Span, JsonOptions);
    }

    public async Task<CheckoutSession?> SaveAsync(CheckoutSession session, CancellationToken cancellationToken = default)
    {
        session.ExpiresAt = DateTime.UtcNow.Add(SessionTtl);
        var json = JsonSerializer.SerializeToUtf8Bytes(session, JsonOptions);
        var saved = await _database.StringSetAsync(GetKey(session.Id), json, SessionTtl);

        if (!saved)
        {
            logger.LogWarning("Problem occurred persisting checkout session {SessionId}.", session.Id);
            return null;
        }

        return session;
    }

    public async Task<bool> DeleteAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        return await _database.KeyDeleteAsync(GetKey(sessionId));
    }
}

