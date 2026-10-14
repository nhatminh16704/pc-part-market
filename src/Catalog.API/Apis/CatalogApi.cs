namespace eShop.Catalog.API;

public static class CatalogApi
{
    public static IEndpointRouteBuilder MapCatalogApi(this IEndpointRouteBuilder app)
    {
        app.MapProductsApi()
           .MapVariantsApi()
           .MapBrandsApi()
           .MapCategoriesApi()
           .MapImagesApi()
           .MapLegacyCatalogApi();

        return app;
    }
}
