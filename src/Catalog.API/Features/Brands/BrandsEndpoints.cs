using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using eShop.Shared.Common;
using eShop.Catalog.API.Common.Validation;
using Microsoft.Extensions.Caching.Hybrid;
using eShop.Catalog.API.Common;

namespace eShop.Catalog.API.Features.Brands;

public class CreateBrandRequest
{
    public string Name { get; set; } = string.Empty;
    public string SeoName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? Status { get; set; } = EntityStatus.Active;
}

public class UpdateBrandRequest
{
    public string Name { get; set; } = string.Empty;
    public string SeoName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? Status { get; set; } = EntityStatus.Active;
}

public class CreateBrandValidator : AbstractValidator<CreateBrandRequest>
{
    public CreateBrandValidator(CatalogContext db)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Brand name is required.")
            .MaximumLength(100).WithMessage("Brand name cannot exceed 100 characters.");

        RuleFor(x => x.SeoName)
            .NotEmpty().WithMessage("Brand seo_name is required.")
            .MaximumLength(100).WithMessage("Brand seo_name cannot exceed 100 characters.")
            .Matches("^[a-z0-9-]+$").WithMessage("Brand seo_name must contain only lowercase letters, numbers, and hyphens.")
            .MustAsync(async (seoName, ct) => !await db.Brands.AnyAsync(b => b.SeoName == seoName && b.Status != EntityStatus.Deleted, ct))
            .WithMessage("Brand seo_name already exists.");
    }
}

public class UpdateBrandValidator : AbstractValidator<UpdateBrandRequest>
{
    public UpdateBrandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Brand name is required.")
            .MaximumLength(100).WithMessage("Brand name cannot exceed 100 characters.");

        RuleFor(x => x.SeoName)
            .NotEmpty().WithMessage("Brand seo_name is required.")
            .MaximumLength(100).WithMessage("Brand seo_name cannot exceed 100 characters.")
            .Matches("^[a-z0-9-]+$").WithMessage("Brand seo_name must contain only lowercase letters, numbers, and hyphens.");
    }
}

public static class BrandsEndpoints
{
    public static IEndpointRouteBuilder MapBrandsEndpoints(this IEndpointRouteBuilder app)
    {
        var vApi = app.NewVersionedApi("Catalog");
        var api = vApi.MapGroup("api/catalog")
            .HasApiVersion(1, 0)
            .HasApiVersion(2, 0)
            .AddEndpointFilter<ValidationFilter>();

        api.MapGet("/brands", GetAllBrands)
            .WithName("ListBrands")
            .WithSummary("List brands")
            .WithDescription("Get all active brands.")
            .WithTags("Brands");

        api.MapGet("/brands/{id:guid}", GetBrandById)
            .WithName("GetBrandById")
            .WithSummary("Get brand by ID")
            .WithTags("Brands");

        api.MapPost("/brands", CreateBrand)
            .WithName("CreateBrand")
            .WithSummary("Create brand")
            .WithTags("Brands");

        api.MapPut("/brands/{id:guid}", UpdateBrand)
            .WithName("UpdateBrand")
            .WithSummary("Update brand")
            .WithTags("Brands");

        api.MapDelete("/brands/{id:guid}", DeleteBrand)
            .WithName("DeleteBrand")
            .WithSummary("Soft-delete brand")
            .WithTags("Brands");

        return app;
    }

    public static async Task<Ok<ApiResponse<List<Brand>>>> GetAllBrands(
        CatalogContext context,
        HybridCache cache,
        CancellationToken cancellationToken)
    {
        var brands = await cache.GetOrCreateAsync(
            CatalogCachePolicies.AllBrandsKey,
            async cancel => await context.Brands
                .AsNoTracking()
                .Where(b => b.Status != EntityStatus.Deleted)
                .OrderBy(b => b.Name)
                .ToListAsync(cancel),
            options: CatalogCachePolicies.StaticMetadata,
            tags: [CatalogCachePolicies.BrandsTag],
            cancellationToken: cancellationToken);

        return TypedResults.Ok(ApiResponse<List<Brand>>.Ok(brands));
    }

    public static async Task<Results<Ok<ApiResponse<Brand>>, NotFound<ApiResponse<Brand>>>> GetBrandById(
        CatalogContext context,
        HybridCache cache,
        Guid id,
        CancellationToken cancellationToken)
    {
        var brand = await cache.GetOrCreateAsync(
            CatalogCachePolicies.BrandKey(id),
            async cancel => await context.Brands
                .AsNoTracking()
                .SingleOrDefaultAsync(b => b.Id == id && b.Status != EntityStatus.Deleted, cancel),
            options: CatalogCachePolicies.StaticMetadata,
            tags: [CatalogCachePolicies.BrandsTag, CatalogCachePolicies.BrandKey(id)],
            cancellationToken: cancellationToken);

        return brand is null 
            ? TypedResults.NotFound(ApiResponse<Brand>.Fail($"Brand with id '{id}' was not found.", 404)) 
            : TypedResults.Ok(ApiResponse<Brand>.Ok(brand));
    }

    public static async Task<Results<Created<Brand>, ValidationProblem>> CreateBrand(
        CatalogContext context,
        ICacheInvalidator invalidator,
        CreateBrandRequest request,
        CancellationToken cancellationToken)
    {
        var brand = new Brand
        {
            Id = Guid.CreateVersion7(),
            Name = request.Name,
            SeoName = request.SeoName,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            Status = string.IsNullOrWhiteSpace(request.Status) ? EntityStatus.Active : request.Status,
            CreatedAt = DateTime.UtcNow
        };

        context.Brands.Add(brand);
        await context.SaveChangesAsync(cancellationToken);

        await invalidator.EvictTagAsync(CatalogCachePolicies.BrandsTag, cancellationToken);

        return TypedResults.Created($"/api/catalog/brands/{brand.Id}", brand);
    }

    public static async Task<Results<Ok<Brand>, NotFound, ValidationProblem>> UpdateBrand(
        CatalogContext context,
        ICacheInvalidator invalidator,
        Guid id,
        UpdateBrandRequest request,
        CancellationToken cancellationToken)
    {
        var existing = await context.Brands.SingleOrDefaultAsync(b => b.Id == id && b.Status != EntityStatus.Deleted, cancellationToken);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        var seoNameTaken = await context.Brands.AnyAsync(b => b.Id != id && b.SeoName == request.SeoName && b.Status != EntityStatus.Deleted, cancellationToken);
        if (seoNameTaken)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                { nameof(request.SeoName), ["Brand seo_name is already in use by another brand."] }
            });
        }

        existing.Name = request.Name;
        existing.SeoName = request.SeoName;
        existing.Description = request.Description;
        existing.ImageUrl = request.ImageUrl;
        existing.Status = string.IsNullOrWhiteSpace(request.Status) ? existing.Status : request.Status;

        await context.SaveChangesAsync(cancellationToken);

        await invalidator.EvictTagAsync(CatalogCachePolicies.BrandsTag, cancellationToken);
        await invalidator.EvictKeyAsync(CatalogCachePolicies.BrandKey(id), cancellationToken);

        return TypedResults.Ok(existing);
    }

    public static async Task<Results<NoContent, NotFound>> DeleteBrand(
        CatalogContext context,
        ICacheInvalidator invalidator,
        Guid id,
        CancellationToken cancellationToken)
    {
        var existing = await context.Brands.SingleOrDefaultAsync(b => b.Id == id && b.Status != EntityStatus.Deleted, cancellationToken);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Status = EntityStatus.Deleted;
        await context.SaveChangesAsync(cancellationToken);

        await invalidator.EvictTagAsync(CatalogCachePolicies.BrandsTag, cancellationToken);
        await invalidator.EvictKeyAsync(CatalogCachePolicies.BrandKey(id), cancellationToken);

        return TypedResults.NoContent();
    }
}
