using eShop.Customer.API.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Customers;

public static class GetCustomerByIdEndpoint
{
    public static RouteHandlerBuilder MapGetCustomerById(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapGet("/{id:guid}", Handle)
            .RequireAuthorization(Extensions.Extensions.StaffOrAdminPolicy)
            .WithName("GetCustomerById")
            .WithSummary("Get customer by ID (Staff/Admin)")
            .WithDescription("Retrieves a specific customer's profile by their ID. Requires Staff or Admin role.")
            .Produces<CustomerProfileDto>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    public static async Task<IResult> Handle(
        Guid id,
        CustomerContext db,
        CancellationToken ct)
    {
        var customer = await db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (customer is null)
        {
            return Results.Problem("Không tìm thấy khách hàng.", statusCode: StatusCodes.Status404NotFound);
        }

        return Results.Ok(CustomerProfileDto.FromEntity(customer));
    }
}
