using eShop.Catalog.API.Infrastructure;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;

namespace eShop.Catalog.API.Grpc;

public class CatalogService(CatalogContext dbContext) : Catalog.CatalogBase
{
    public override async Task<CatalogVariantResponse> GetVariantById(GetVariantByIdRequest request, ServerCallContext context)
    {
        if (!Guid.TryParse(request.Id, out var variantId))
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, $"Invalid Variant ID: {request.Id}"));
        }

        var variant = await dbContext.ProductVariants
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == variantId, context.CancellationToken);

        if (variant == null)
        {
            throw new RpcException(new Status(StatusCode.NotFound, $"Variant with ID {request.Id} not found"));
        }

        return new CatalogVariantResponse
        {
            Id = variant.Id.ToString(),
            ProductId = variant.ProductId.ToString(),
            Price = variant.Price,
            Quantity = variant.Quantity,
            Sku = variant.Sku ?? string.Empty,
            Model = variant.Model ?? string.Empty,
            ImageUrl = variant.ImageUrl ?? string.Empty
        };
    }

    public override async Task<CatalogProductResponse> GetProductById(GetProductByIdRequest request, ServerCallContext context)
    {
        if (!Guid.TryParse(request.Id, out var productId))
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, $"Invalid Product ID: {request.Id}"));
        }

        var product = await dbContext.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == productId, context.CancellationToken);

        if (product == null)
        {
            throw new RpcException(new Status(StatusCode.NotFound, $"Product with ID {request.Id} not found"));
        }

        return new CatalogProductResponse
        {
            Id = product.Id.ToString(),
            Name = product.Name ?? string.Empty,
            Description = product.Description ?? string.Empty
        };
    }
}
