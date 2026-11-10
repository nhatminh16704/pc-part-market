using eShop.Catalog.API.Grpc;
using Grpc.Core;

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

public class CatalogGrpcClient(global::eShop.Catalog.API.Grpc.Catalog.CatalogClient client, ILogger<CatalogGrpcClient> logger) : ICatalogApiClient
{
    public async Task<CatalogVariantDto?> GetVariantAsync(Guid variantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new GetVariantByIdRequest { Id = variantId.ToString() };
            var response = await client.GetVariantByIdAsync(request, cancellationToken: cancellationToken);

            return new CatalogVariantDto(
                Guid.Parse(response.Id),
                Guid.Parse(response.ProductId),
                response.Price,
                response.Quantity,
                response.Sku,
                string.IsNullOrEmpty(response.Model) ? null : response.Model,
                string.IsNullOrEmpty(response.ImageUrl) ? null : response.ImageUrl
            );
        }
        catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
        {
            logger.LogWarning("Variant {VariantId} not found in catalog-api via gRPC", variantId);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch variant {VariantId} from catalog-api via gRPC", variantId);
            return null;
        }
    }

    public async Task<CatalogProductDto?> GetProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new GetProductByIdRequest { Id = productId.ToString() };
            var response = await client.GetProductByIdAsync(request, cancellationToken: cancellationToken);

            return new CatalogProductDto(
                Guid.Parse(response.Id),
                response.Name,
                string.IsNullOrEmpty(response.Description) ? null : response.Description
            );
        }
        catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
        {
            logger.LogWarning("Product {ProductId} not found in catalog-api via gRPC", productId);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch product {ProductId} from catalog-api via gRPC", productId);
            return null;
        }
    }
}
