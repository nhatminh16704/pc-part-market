using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace eShop.Catalog.API.Features.Variants;

public class UpdateVariantRequest
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

public class UpdateVariantValidator : AbstractValidator<UpdateVariantRequest>
{
    public UpdateVariantValidator()
    {
        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to 0.");

        RuleFor(x => x.Quantity)
            .GreaterThanOrEqualTo(0).WithMessage("Quantity must be greater than or equal to 0.");

        RuleFor(x => x.Sku)
            .NotEmpty().WithMessage("Variant SKU is required.")
            .MaximumLength(50).WithMessage("Variant SKU cannot exceed 50 characters.");

        RuleFor(x => x.WarrantyMonths)
            .GreaterThanOrEqualTo(0).WithMessage("Warranty months must be greater than or equal to 0.");
    }
}

public static class UpdateVariantHandler
{
    public static async Task<Results<Ok<ProductVariant>, NotFound, ValidationProblem>> Handle(
        CatalogContext context,
        Guid id,
        UpdateVariantRequest request)
    {
        var existing = await context.ProductVariants.SingleOrDefaultAsync(v => v.Id == id && v.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        var skuTaken = await context.ProductVariants.AnyAsync(v => v.Id != id && v.Sku == request.Sku && v.Status != EntityStatus.Deleted);
        if (skuTaken)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                { nameof(request.Sku), ["Variant SKU is already in use by another variant."] }
            });
        }

        existing.Price = request.Price;
        existing.Quantity = request.Quantity;
        existing.Sku = request.Sku;
        existing.Model = request.Model;
        existing.ImageUrl = request.ImageUrl;
        existing.Description = request.Description;
        existing.WarrantyMonths = request.WarrantyMonths;
        existing.Barcode = request.Barcode;
        existing.ReleaseAt = request.ReleaseAt;
        existing.Status = string.IsNullOrWhiteSpace(request.Status) ? existing.Status : request.Status;
        existing.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return TypedResults.Ok(existing);
    }
}
