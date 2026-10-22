using System.Net.Http.Json;
using System.Text.Json;

namespace eShop.Basket.API.Services;

public interface ICatalogApiClient
{
    Task<CatalogVariantDto?> GetVariantAsync(Guid variantId, CancellationToken cancellationToken = default);
    Task<CatalogProductDto?> GetProductAsync(Guid productId, CancellationToken cancellationToken = default);
}

public record CatalogVariantDto(
    Guid Id,
    Guid ProductId,
    long Price,
    int Quantity,
    string Sku,
    string? Model,
    string? ImageUrl
);

public record CatalogProductDto(
    Guid Id,
    string Name,
    string? Description
);

public class CatalogApiClient(HttpClient httpClient, ILogger<CatalogApiClient> logger) : ICatalogApiClient
{
    public async Task<CatalogVariantDto?> GetVariantAsync(Guid variantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await httpClient.GetAsync($"/api/catalog/variants/{variantId}", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            return await response.Content.ReadFromJsonAsync<CatalogVariantDto>(cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch variant {VariantId} from catalog-api", variantId);
            return null;
        }
    }

    public async Task<CatalogProductDto?> GetProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await httpClient.GetAsync($"/api/catalog/products/{productId}", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(cancellationToken), cancellationToken: cancellationToken);
            if (doc.RootElement.TryGetProperty("data", out var dataElement) && dataElement.ValueKind == JsonValueKind.Object)
            {
                var id = dataElement.GetProperty("id").GetGuid();
                var name = dataElement.GetProperty("name").GetString() ?? string.Empty;
                var description = dataElement.TryGetProperty("description", out var desc) ? desc.GetString() : null;
                return new CatalogProductDto(id, name, description);
            }

            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch product {ProductId} from catalog-api", productId);
            return null;
        }
    }
}
