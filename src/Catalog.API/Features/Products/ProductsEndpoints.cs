using eShop.Catalog.API.Common.Validation;

namespace eShop.Catalog.API.Features.Products;

public static class ProductsEndpoints
{
    public static IEndpointRouteBuilder MapProductsEndpoints(this IEndpointRouteBuilder app)
    {
        var vApi = app.NewVersionedApi("Catalog");
        var api = vApi.MapGroup("api/catalog")
            .HasApiVersion(1, 0)
            .HasApiVersion(2, 0)
            .AddEndpointFilter<ValidationFilter>();

        api.MapGet("/products", GetProductsHandler.GetAll)
            .WithName("ListProducts")
            .WithSummary("List products")
            .WithDescription("Get a paginated list of products.")
            .WithTags("Products");

        api.MapGet("/products/{id:guid}", GetProductsHandler.ById)
            .WithName("GetProductById")
            .WithSummary("Get product by ID")
            .WithDescription("Get a product by its unique UUID.")
            .WithTags("Products");

        api.MapGet("/products/seo/{seoName}", GetProductsHandler.BySeoName)
            .WithName("GetProductBySeoName")
            .WithSummary("Get product by SEO name")
            .WithDescription("Get a product by its unique SEO name.")
            .WithTags("Products");

        api.MapPost("/products/search", SearchProductsHandler.Handle)
            .WithName("SearchProducts")
            .WithSummary("Search products by criteria")
            .WithDescription("Search products with structured filter criteria including keyword, category, brand, price range, and specs.")
            .WithTags("Products");

        api.MapPost("/products", CreateProductHandler.Handle)
            .WithName("CreateProduct")
            .WithSummary("Create a new product")
            .WithDescription("Create a new product in the catalog.")
            .WithTags("Products");

        api.MapPut("/products/{id:guid}", UpdateProductHandler.Handle)
            .WithName("UpdateProduct")
            .WithSummary("Update a product")
            .WithDescription("Update details of an existing product.")
            .WithTags("Products");

        api.MapDelete("/products/{id:guid}", DeleteProductHandler.Handle)
            .WithName("DeleteProduct")
            .WithSummary("Soft-delete a product")
            .WithDescription("Mark a product as deleted.")
            .WithTags("Products");

        return app;
    }
}
