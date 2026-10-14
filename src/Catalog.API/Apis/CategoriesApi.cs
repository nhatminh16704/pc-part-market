using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using eShop.Shared.Common;

namespace eShop.Catalog.API;

public static class CategoriesApi
{
    public static IEndpointRouteBuilder MapCategoriesApi(this IEndpointRouteBuilder app)
    {
        var vApi = app.NewVersionedApi("Catalog");
        var api = vApi.MapGroup("api/catalog").HasApiVersion(1, 0).HasApiVersion(2, 0);

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

    public static async Task<Ok<ApiResponse<List<Category>>>> GetAllCategories(CatalogContext context)
    {
        var categories = await context.Categories
            .AsNoTracking()
            .Where(c => c.Status != EntityStatus.Deleted)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return TypedResults.Ok(ApiResponse<List<Category>>.Ok(categories));
    }

    public static async Task<Results<Ok<ApiResponse<Category>>, NotFound<ApiResponse<Category>>>> GetCategoryById(CatalogContext context, Guid id)
    {
        var category = await context.Categories
            .AsNoTracking()
            .Include(c => c.SubCategories.Where(sc => sc.Status != EntityStatus.Deleted))
            .SingleOrDefaultAsync(c => c.Id == id && c.Status != EntityStatus.Deleted);

        return category is null 
            ? TypedResults.NotFound(ApiResponse<Category>.Fail($"Category with id '{id}' was not found.", 404)) 
            : TypedResults.Ok(ApiResponse<Category>.Ok(category));
    }

    public static async Task<Results<Created<Category>, BadRequest<string>>> CreateCategory(CatalogContext context, Category category)
    {
        if (string.IsNullOrWhiteSpace(category.Name) || string.IsNullOrWhiteSpace(category.SeoName))
        {
            return TypedResults.BadRequest("Category name and seo_name are required.");
        }

        category.Id = category.Id == Guid.Empty ? Guid.CreateVersion7() : category.Id;
        category.CreatedAt = DateTime.UtcNow;
        category.Status = string.IsNullOrWhiteSpace(category.Status) ? EntityStatus.Active : category.Status;

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        return TypedResults.Created($"/api/catalog/categories/{category.Id}", category);
    }

    public static async Task<Results<Ok<Category>, NotFound>> UpdateCategory(CatalogContext context, Guid id, Category updateDto)
    {
        var existing = await context.Categories.SingleOrDefaultAsync(c => c.Id == id && c.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Name = updateDto.Name;
        existing.SeoName = updateDto.SeoName;
        existing.Description = updateDto.Description;
        existing.ParentId = updateDto.ParentId;
        existing.Status = updateDto.Status;

        await context.SaveChangesAsync();
        return TypedResults.Ok(existing);
    }

    public static async Task<Results<NoContent, NotFound>> DeleteCategory(CatalogContext context, Guid id)
    {
        var existing = await context.Categories.SingleOrDefaultAsync(c => c.Id == id && c.Status != EntityStatus.Deleted);
        if (existing is null)
        {
            return TypedResults.NotFound();
        }

        existing.Status = EntityStatus.Deleted;
        await context.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
