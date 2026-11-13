using System.Security.Claims;
using eShop.Customer.API.Extensions;
using eShop.Customer.API.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Addresses;

public static class SetDefaultAddressEndpoint
{
    public static RouteHandlerBuilder MapSetDefaultAddress(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPatch("/me/addresses/{addressId:guid}/default", Handle)
            .RequireAuthorization()
            .WithName("SetDefaultAddress")
            .WithSummary("Set default shipping address")
            .WithDescription("Marks the specified address as the default shipping address for the authenticated customer.")
            .Produces<CustomerAddressDto>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    public static async Task<IResult> Handle(
        Guid addressId,
        ClaimsPrincipal user,
        CustomerContext db,
        CancellationToken ct)
    {
        var customerId = user.GetCustomerId();
        if (customerId is null)
        {
            return Results.Problem("Chưa xác thực người dùng.", statusCode: StatusCodes.Status401Unauthorized);
        }

        var address = await db.CustomerAddresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.CustomerId == customerId.Value, ct);

        if (address is null)
        {
            return Results.Problem("Không tìm thấy địa chỉ.", statusCode: StatusCodes.Status404NotFound);
        }

        if (!address.IsDefault)
        {
            await using var transaction = await db.Database.BeginTransactionAsync(ct);

            await db.CustomerAddresses
                .Where(a => a.CustomerId == customerId.Value && a.IsDefault && a.Id != addressId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(a => a.IsDefault, false)
                    .SetProperty(a => a.UpdatedAt, DateTime.UtcNow), ct);

            address.IsDefault = true;
            address.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }

        return Results.Ok(CustomerAddressDto.FromEntity(address));
    }
}
