using eShop.Customer.API.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Addresses;

public static class GetCustomerAddressesEndpoint
{
    public static RouteHandlerBuilder MapGetCustomerAddresses(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapGet("/{id:guid}/addresses", Handle)
            .RequireAuthorization(Extensions.Extensions.StaffOrAdminPolicy)
            .WithName("GetCustomerAddresses")
            .WithSummary("Get addresses by customer ID (Staff/Admin)")
            .WithDescription("Returns all shipping addresses for a specific customer. Requires Staff or Admin role.")
            .Produces<IReadOnlyList<CustomerAddressDto>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    public static async Task<IResult> Handle(
        Guid id,
        CustomerContext db,
        CancellationToken ct)
    {
        var customerExists = await db.Customers.AnyAsync(c => c.Id == id, ct);
        if (!customerExists)
        {
            return Results.Problem("Không tìm thấy khách hàng.", statusCode: StatusCodes.Status404NotFound);
        }

        var addresses = await db.CustomerAddresses
            .AsNoTracking()
            .Where(a => a.CustomerId == id)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .Select(a => CustomerAddressDto.FromEntity(a))
            .ToListAsync(ct);

        return Results.Ok(addresses);
    }
}
