using eShop.Catalog.API.Features.Brands;
using eShop.Catalog.API.Features.Categories;
using eShop.Catalog.API.Features.Images;
using eShop.Catalog.API.Features.Products;
using eShop.Catalog.API.Features.Variants;

namespace eShop.Catalog.API;

public static class CatalogEndpoints
{
    public static IEndpointRouteBuilder MapCatalogApi(this IEndpointRouteBuilder app)
    {
        app.MapProductsEndpoints()
           .MapVariantsEndpoints()
           .MapBrandsEndpoints()
           .MapCategoriesEndpoints()
           .MapImagesEndpoints();

        return app;
    }
}
