namespace eShop.Catalog.API.Common;

public interface ICacheInvalidator
{
    Task EvictKeyAsync(string key, CancellationToken cancellationToken = default);
    Task EvictTagAsync(string tag, CancellationToken cancellationToken = default);
}
