using System.Security.Claims;
using eShop.Customer.API.Extensions;
using eShop.Customer.API.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Addresses;

public static class DeleteMyAddressEndpoint
{
    public static RouteHandlerBuilder MapDeleteMyAddress(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapDelete("/me/addresses/{addressId:guid}", Handle)
            .RequireAuthorization()
            .WithName("DeleteMyAddress")
            .WithSummary("Delete a shipping address")
            .WithDescription("Deletes a shipping address owned by the authenticated customer. If the deleted address was the default, the most recent remaining address becomes the new default.")
            .Produces(StatusCodes.Status204NoContent)
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

        var wasDefault = address.IsDefault;

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        db.CustomerAddresses.Remove(address);
        await db.SaveChangesAsync(ct);

        if (wasDefault)
        {
            var nextAddress = await db.CustomerAddresses
                .Where(a => a.CustomerId == customerId.Value)
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (nextAddress is not null)
            {
                nextAddress.IsDefault = true;
                nextAddress.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync(ct);
            }
        }

        await transaction.CommitAsync(ct);

        return Results.NoContent();
    }
}
