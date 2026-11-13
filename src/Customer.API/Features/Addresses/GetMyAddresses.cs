using System.Security.Claims;
using eShop.Customer.API.Extensions;
using eShop.Customer.API.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Addresses;

public static class GetMyAddressesEndpoint
{
    public static RouteHandlerBuilder MapGetMyAddresses(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapGet("/me/addresses", Handle)
            .RequireAuthorization()
            .WithName("GetMyAddresses")
            .WithSummary("Get current customer's addresses")
            .WithDescription("Returns all shipping addresses for the authenticated customer, ordered with the default address first.")
            .Produces<IReadOnlyList<CustomerAddressDto>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    public static async Task<IResult> Handle(
        ClaimsPrincipal user,
        CustomerContext db,
        CancellationToken ct)
    {
        var customerId = user.GetCustomerId();
        if (customerId is null)
        {
            return Results.Problem("Chưa xác thực người dùng.", statusCode: StatusCodes.Status401Unauthorized);
        }

        var addresses = await db.CustomerAddresses
            .AsNoTracking()
            .Where(a => a.CustomerId == customerId.Value)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .Select(a => CustomerAddressDto.FromEntity(a))
            .ToListAsync(ct);

        return Results.Ok(addresses);
    }
}
