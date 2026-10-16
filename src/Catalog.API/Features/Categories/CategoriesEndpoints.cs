using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using eShop.Shared.Common;
using eShop.Catalog.API.Common.Validation;
using Microsoft.Extensions.Caching.Hybrid;
using eShop.Catalog.API.Common;

namespace eShop.Catalog.API.Features.Categories;

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string SeoName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }
    public string? Status { get; set; } = EntityStatus.Active;
}

public class UpdateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string SeoName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }
    public string? Status { get; set; } = EntityStatus.Active;
}

public class CreateCategoryValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryValidator(CatalogContext db)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required.")
            .MaximumLength(100).WithMessage("Category name cannot exceed 100 characters.");

        RuleFor(x => x.SeoName)
            .NotEmpty().WithMessage("Category seo_name is required.")
            .MaximumLength(100).WithMessage("Category seo_name cannot exceed 100 characters.")
            .Matches("^[a-z0-9-]+$").WithMessage("Category seo_name must contain only lowercase letters, numbers, and hyphens.")
            .MustAsync(async (seoName, ct) => !await db.Categories.AnyAsync(c => c.SeoName == seoName && c.Status != EntityStatus.Deleted, ct))
            .WithMessage("Category seo_name already exists.");

        When(x => x.ParentId.HasValue, () =>
        {
            RuleFor(x => x.ParentId!.Value)
                .MustAsync(async (parentId, ct) => await db.Categories.AnyAsync(c => c.Id == parentId && c.Status != EntityStatus.Deleted, ct))
                .WithMessage("Parent category does not exist.");
        });
    }
}

public class UpdateCategoryValidator : AbstractValidator<UpdateCategoryRequest>
{
    public UpdateCategoryValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required.")
            .MaximumLength(100).WithMessage("Category name cannot exceed 100 characters.");

        RuleFor(x => x.SeoName)
            .NotEmpty().WithMessage("Category seo_name is required.")
            .MaximumLength(100).WithMessage("Category seo_name cannot exceed 100 characters.")
            .Matches("^[a-z0-9-]+$").WithMessage("Category seo_name must contain only lowercase letters, numbers, and hyphens.");
    }
}

public static class CategoriesEndpoints
{
    public static IEndpointRouteBuilder MapCategoriesEndpoints(this IEndpointRouteBuilder app)
    {
        var vApi = app.NewVersionedApi("Catalog");
        var api = vApi.MapGroup("api/catalog")
            .HasApiVersion(1, 0)
            .HasApiVersion(2, 0)
            .AddEndpointFilter<ValidationFilter>();

        api.MapGet("/categories", GetAllCategories)
            .WithName("ListCategories")
            .WithSummary("List categories")
            .WithDescription("Get all active categories.")
            .WithTags("Categories");

        api.MapGet("/categories/{id:guid}", GetCategoryById)
            .WithName("GetCategoryById")
            .WithSummary("Get category by ID")
            .WithTags("Categories");

        api.MapPost("/categories", CreateCategory)
            .WithName("CreateCategory")
            .WithSummary("Create category")
            .WithTags("Categories");

        api.MapPut("/categories/{id:guid}", UpdateCategory)
            .WithName("UpdateCategory")
            .WithSummary("Update category")
            .WithTags("Categories");

        api.MapDelete("/categories/{id:guid}", DeleteCategory)
            .WithName("DeleteCategory")
            .WithSummary("Soft-delete category")
            .WithTags("Categories");

        return app;
    }

    public static async Task<Ok<ApiResponse<List<Category>>>> GetAllCategories(
        CatalogContext context,
        HybridCache cache,
        CancellationToken cancellationToken)
    {
        var categories = await cache.GetOrCreateAsync(
            CatalogCachePolicies.AllCategoriesKey,
            async cancel => await context.Categories
                .AsNoTracking()
                .Where(c => c.Status != EntityStatus.Deleted)
                .OrderBy(c => c.Name)
                .ToListAsync(cancel),
            options: CatalogCachePolicies.StaticMetadata,
            tags: [CatalogCachePolicies.CategoriesTag],
            cancellationToken: cancellationToken);

        return TypedResults.Ok(ApiResponse<List<Category>>.Ok(categories));
    }

    public static async Task<Results<Ok<ApiResponse<Category>>, NotFound<ApiResponse<Category>>>> GetCategoryById(
        CatalogContext context,
        HybridCache cache,
        Guid id,
        CancellationToken cancellationToken)
    {
        var category = await cache.GetOrCreateAsync(
            CatalogCachePolicies.CategoryKey(id),
            async cancel => await context.Categories
                .AsNoTracking()
                .Include(c => c.SubCategories.Where(sc => sc.Status != EntityStatus.Deleted))
                .SingleOrDefaultAsync(c => c.Id == id && c.Status != EntityStatus.Deleted, cancel),
            options: CatalogCachePolicies.StaticMetadata,
            tags: [CatalogCachePolicies.CategoriesTag, CatalogCachePolicies.CategoryKey(id)],
            cancellationToken: cancellationToken);

        return category is null 
            ? TypedResults.NotFound(ApiResponse<Category>.Fail($"Category with id '{id}' was not found.", 404)) 
            : TypedResults.Ok(ApiResponse<Category>.Ok(category));
    }

    public static async Task<Results<Created<Category>, ValidationProblem>> CreateCategory(
        CatalogContext context,
        HybridCache cache,
        CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Id = Guid.CreateVersion7(),
            Name = request.Name,
            SeoName = request.SeoName,
            Description = request.Description,
            ParentId = request.ParentId,
            Status = string.IsNullOrWhiteSpace(request.Status) ? EntityStatus.Active : request.Status,
            CreatedAt = DateTime.UtcNow
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync(cancellationToken);

        await cache.RemoveByTagAsync(CatalogCachePolicies.CategoriesTag, cancellationToken);

        return TypedResults.Created($"/api/catalog/categories/{category.Id}", category);
    }

    public static async Task<Results<Ok<Category>, NotFound, ValidationProblem>> UpdateCategory(
        CatalogContext context,
        HybridCache cache,
        Guid id,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var existing = await context.Categories.SingleOrDefaultAsync(c => c.Id == id && c.Status != EntityStatus.Deleted, cancellationToken);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        if (request.ParentId == id)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                { nameof(request.ParentId), ["A category cannot be its own parent."] }
            });
        }

        var seoNameTaken = await context.Categories.AnyAsync(c => c.Id != id && c.SeoName == request.SeoName && c.Status != EntityStatus.Deleted, cancellationToken);
        if (seoNameTaken)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                { nameof(request.SeoName), ["Category seo_name is already in use by another category."] }
            });
        }

        if (request.ParentId.HasValue)
        {
            var parentExists = await context.Categories.AnyAsync(c => c.Id == request.ParentId.Value && c.Status != EntityStatus.Deleted, cancellationToken);
            if (!parentExists)
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    { nameof(request.ParentId), ["Parent category does not exist."] }
                });
            }
        }

        existing.Name = request.Name;
        existing.SeoName = request.SeoName;
        existing.Description = request.Description;
        existing.ParentId = request.ParentId;
        existing.Status = string.IsNullOrWhiteSpace(request.Status) ? existing.Status : request.Status;

        await context.SaveChangesAsync(cancellationToken);

        await cache.RemoveByTagAsync(CatalogCachePolicies.CategoriesTag, cancellationToken);
        await cache.RemoveAsync(CatalogCachePolicies.CategoryKey(id), cancellationToken);

        return TypedResults.Ok(existing);
    }

    public static async Task<Results<NoContent, NotFound>> DeleteCategory(
        CatalogContext context,
        HybridCache cache,
        Guid id,
        CancellationToken cancellationToken)
    {
        var existing = await context.Categories.SingleOrDefaultAsync(c => c.Id == id && c.Status != EntityStatus.Deleted, cancellationToken);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Status = EntityStatus.Deleted;
        await context.SaveChangesAsync(cancellationToken);

        await cache.RemoveByTagAsync(CatalogCachePolicies.CategoriesTag, cancellationToken);
        await cache.RemoveAsync(CatalogCachePolicies.CategoryKey(id), cancellationToken);

        return TypedResults.NoContent();
    }
}
