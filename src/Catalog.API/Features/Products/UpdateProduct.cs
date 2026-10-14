using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace eShop.Catalog.API.Features.Products;

public class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string SeoName { get; set; } = string.Empty;
    public Guid? BrandId { get; set; }
    public Guid CategoryId { get; set; }
    public string? Specifications { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; } = EntityStatus.Active;
}

public class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductValidator(CatalogContext db)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(255).WithMessage("Product name cannot exceed 255 characters.");

        RuleFor(x => x.SeoName)
            .NotEmpty().WithMessage("Product seo_name is required.")
            .MaximumLength(255).WithMessage("Product seo_name cannot exceed 255 characters.")
            .Matches("^[a-z0-9-]+$").WithMessage("Product seo_name must contain only lowercase letters, numbers, and hyphens.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category ID is required.")
            .MustAsync(async (catId, ct) => await db.Categories.AnyAsync(c => c.Id == catId && c.Status != EntityStatus.Deleted, ct))
            .WithMessage("Category does not exist.");

        When(x => x.BrandId.HasValue, () =>
        {
            RuleFor(x => x.BrandId!.Value)
                .MustAsync(async (brandId, ct) => await db.Brands.AnyAsync(b => b.Id == brandId && b.Status != EntityStatus.Deleted, ct))
                .WithMessage("Brand does not exist.");
        });
    }
}

public static class UpdateProductHandler
{
    public static async Task<Results<Ok<Product>, NotFound, ValidationProblem>> Handle(
        CatalogContext context,
        Guid id,
        UpdateProductRequest request)
    {
        var existing = await context.Products.SingleOrDefaultAsync(p => p.Id == id && p.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        var seoNameTaken = await context.Products.AnyAsync(p => p.Id != id && p.SeoName == request.SeoName && p.Status != EntityStatus.Deleted);
        if (seoNameTaken)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                { nameof(request.SeoName), ["Product seo_name is already in use by another product."] }
            });
        }

        existing.Name = request.Name;
        existing.SeoName = request.SeoName;
        existing.BrandId = request.BrandId;
        existing.CategoryId = request.CategoryId;
        existing.Specifications = request.Specifications;
        existing.Description = request.Description;
        existing.Status = string.IsNullOrWhiteSpace(request.Status) ? existing.Status : request.Status;
        existing.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return TypedResults.Ok(existing);
    }
}
