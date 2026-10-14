using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace eShop.Catalog.API.Features.Products;

public class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string SeoName { get; set; } = string.Empty;
    public Guid? BrandId { get; set; }
    public Guid CategoryId { get; set; }
    public string? Specifications { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; } = EntityStatus.Active;
}

public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator(CatalogContext db)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(255).WithMessage("Product name cannot exceed 255 characters.");

        RuleFor(x => x.SeoName)
            .NotEmpty().WithMessage("Product seo_name is required.")
            .MaximumLength(255).WithMessage("Product seo_name cannot exceed 255 characters.")
            .Matches("^[a-z0-9-]+$").WithMessage("Product seo_name must contain only lowercase letters, numbers, and hyphens.")
            .MustAsync(async (seoName, ct) => !await db.Products.AnyAsync(p => p.SeoName == seoName && p.Status != EntityStatus.Deleted, ct))
            .WithMessage("Product seo_name already exists.");

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

public static class CreateProductHandler
{
    public static async Task<Results<Created<Product>, ValidationProblem>> Handle(
        CatalogContext context,
        CreateProductRequest request)
    {
        var product = new Product
        {
            Id = Guid.CreateVersion7(),
            Name = request.Name,
            SeoName = request.SeoName,
            BrandId = request.BrandId,
            CategoryId = request.CategoryId,
            Specifications = request.Specifications,
            Description = request.Description,
            Status = string.IsNullOrWhiteSpace(request.Status) ? EntityStatus.Active : request.Status,
            CreatedAt = DateTime.UtcNow
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        return TypedResults.Created($"/api/catalog/products/{product.Id}", product);
    }
}
