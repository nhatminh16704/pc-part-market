namespace eShop.Customer.API.Features.Addresses;

public static class AddressEndpoints
{
    public static IEndpointRouteBuilder MapAddressEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/customers")
            .WithTags("Addresses");

        group.MapGetMyAddresses();
        group.MapCreateMyAddress();
        group.MapUpdateMyAddress();

        return app;
    }
}
