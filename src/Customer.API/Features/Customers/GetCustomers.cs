using eShop.Customer.API.Extensions;
using eShop.Customer.API.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Customers;

public record CustomerListResponse(
    int PageIndex,
    int PageSize,
    long Count,
    IReadOnlyList<CustomerProfileDto> Data
);

public static class GetCustomersEndpoint
{
    public static RouteHandlerBuilder MapGetCustomers(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapGet("/", Handle)
            .RequireAuthorization(Extensions.Extensions.StaffOrAdminPolicy)
            .WithName("GetCustomers")
            .WithSummary("List customers (Staff/Admin)")
            .WithDescription("Returns a paginated list of customers with optional search by email, name, or phone.")
            .Produces<CustomerListResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    public static async Task<IResult> Handle(
        CustomerContext db,
        string? q = null,
        int pageIndex = 0,
        int pageSize = 20,
        CancellationToken ct = default)
    {
        pageIndex = Math.Max(0, pageIndex);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Customers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = $"%{q.Trim()}%";
            query = query.Where(c =>
                EF.Functions.ILike(c.Email, term) ||
                (c.FirstName != null && EF.Functions.ILike(c.FirstName, term)) ||
                (c.LastName != null && EF.Functions.ILike(c.LastName, term)) ||
                (c.PhoneNumber != null && EF.Functions.ILike(c.PhoneNumber, term)));
        }

        var totalCount = await query.LongCountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .Select(c => CustomerProfileDto.FromEntity(c))
            .ToListAsync(ct);

        return Results.Ok(new CustomerListResponse(pageIndex, pageSize, totalCount, items));
    }
}
