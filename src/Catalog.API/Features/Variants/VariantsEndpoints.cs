using eShop.Catalog.API.Common.Validation;

namespace eShop.Catalog.API.Features.Variants;

public static class VariantsEndpoints
{
    public static IEndpointRouteBuilder MapVariantsEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("api/v1/catalog").AddEndpointFilter<ValidationFilter>();

        api.MapGet("/products/{productId:guid}/variants", GetVariantsHandler.ByProductId)
            .WithName("ListProductVariants")
            .WithSummary("List product variants")
            .WithDescription("Get all variants for a given product.")
            .WithTags("Variants");

        api.MapGet("/variants/{id:guid}", GetVariantsHandler.ById)
            .WithName("GetVariantById")
            .WithSummary("Get variant by ID")
            .WithDescription("Get a specific variant by its UUID.")
            .WithTags("Variants");

        api.MapPost("/products/{productId:guid}/variants", CreateVariantHandler.Handle)
            .WithName("CreateVariant")
            .WithSummary("Create product variant")
            .WithDescription("Add a new variant to a product.")
            .WithTags("Variants");

        api.MapPut("/variants/{id:guid}", UpdateVariantHandler.Handle)
            .WithName("UpdateVariant")
            .WithSummary("Update variant")
            .WithDescription("Update details of a product variant.")
            .WithTags("Variants");

        api.MapDelete("/variants/{id:guid}", DeleteVariantHandler.Handle)
            .WithName("DeleteVariant")
            .WithSummary("Soft-delete variant")
            .WithDescription("Mark a product variant as deleted.")
            .WithTags("Variants");

        return app;
    }
}
