using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace eShop.Catalog.API.Features.Variants;

public class CreateVariantRequest
{
    public long Price { get; set; }
    public int Quantity { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public int WarrantyMonths { get; set; }
    public string? Barcode { get; set; }
    public DateOnly? ReleaseAt { get; set; }
    public string? Status { get; set; } = EntityStatus.Active;
}

public class CreateVariantValidator : AbstractValidator<CreateVariantRequest>
{
    public CreateVariantValidator(CatalogContext db)
    {
        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to 0.");

        RuleFor(x => x.Quantity)
            .GreaterThanOrEqualTo(0).WithMessage("Quantity must be greater than or equal to 0.");

        RuleFor(x => x.Sku)
            .NotEmpty().WithMessage("Variant SKU is required.")
            .MaximumLength(50).WithMessage("Variant SKU cannot exceed 50 characters.")
            .MustAsync(async (sku, ct) => !await db.ProductVariants.AnyAsync(v => v.Sku == sku && v.Status != EntityStatus.Deleted, ct))
            .WithMessage("Variant SKU already exists.");

        RuleFor(x => x.WarrantyMonths)
            .GreaterThanOrEqualTo(0).WithMessage("Warranty months must be greater than or equal to 0.");
    }
}

public static class CreateVariantHandler
{
    public static async Task<Results<Created<ProductVariant>, NotFound, ValidationProblem>> Handle(
        CatalogContext context,
        Guid productId,
        CreateVariantRequest request)
    {
        var productExists = await context.Products.AnyAsync(p => p.Id == productId && p.Status != EntityStatus.Deleted);
        if (!productExists)
        {
            return TypedResults.NotFound();
        }

        var variant = new ProductVariant
        {
            Id = Guid.CreateVersion7(),
            ProductId = productId,
            Price = request.Price,
            Quantity = request.Quantity,
            Sku = request.Sku,
            Model = request.Model,
            ImageUrl = request.ImageUrl,
            Description = request.Description,
            WarrantyMonths = request.WarrantyMonths,
            Barcode = request.Barcode,
            ReleaseAt = request.ReleaseAt,
            Status = string.IsNullOrWhiteSpace(request.Status) ? EntityStatus.Active : request.Status,
            CreatedAt = DateTime.UtcNow
        };

        context.ProductVariants.Add(variant);
        await context.SaveChangesAsync();

        return TypedResults.Created($"/api/catalog/variants/{variant.Id}", variant);
    }
}
