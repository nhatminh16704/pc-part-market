using System.Security.Claims;
using eShop.Customer.API.Extensions;
using eShop.Customer.API.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Customers;

public static class GetMyProfileEndpoint
{
    public static RouteHandlerBuilder MapGetMyProfile(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapGet("/me", Handle)
            .RequireAuthorization()
            .WithName("GetMyProfile")
            .WithSummary("Get current customer profile")
            .WithDescription("Retrieves the authenticated customer's profile. Auto-provisions a profile record on first access if it does not exist yet.")
            .Produces<CustomerProfileDto>(StatusCodes.Status200OK)
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

        var customer = await db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == customerId.Value, ct);

        if (customer is null)
        {
            customer = new Model.Customer
            {
                Id = customerId.Value,
                Email = user.GetEmail(),
                CreatedAt = DateTime.UtcNow
            };

            db.Customers.Add(customer);
            await db.SaveChangesAsync(ct);
        }

        return Results.Ok(CustomerProfileDto.FromEntity(customer));
    }
}
