namespace eShop.Customer.API.Features.Customers;

public static class CustomerEndpoints
{
    public static IEndpointRouteBuilder MapCustomerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/customers")
            .WithTags("Customers");

        group.MapGetMyProfile();
        group.MapUpdateMyProfile();
        group.MapGetCustomers();
        group.MapGetCustomerById();

        return app;
    }
}
