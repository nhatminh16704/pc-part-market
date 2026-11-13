using System.Security.Claims;
using eShop.Customer.API.Extensions;
using eShop.Customer.API.Infrastructure;
using eShop.Customer.API.Model;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Addresses;

public record CreateAddressRequest(
    string ReceiverName,
    string ReceiverPhone,
    string Province,
    string District,
    string Ward,
    string StreetAddress,
    string? PostalCode,
    bool IsDefault,
    string? Label
);

public class CreateAddressValidator : AbstractValidator<CreateAddressRequest>
{
    public CreateAddressValidator()
    {
        RuleFor(x => x.ReceiverName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ReceiverPhone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Province).NotEmpty().MaximumLength(100);
        RuleFor(x => x.District).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Ward).NotEmpty().MaximumLength(100);
        RuleFor(x => x.StreetAddress).NotEmpty().MaximumLength(255);
        RuleFor(x => x.PostalCode).MaximumLength(20);
        RuleFor(x => x.Label).MaximumLength(50);
    }
}

public static class CreateMyAddressEndpoint
{
    public static RouteHandlerBuilder MapCreateMyAddress(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPost("/me/addresses", Handle)
            .RequireAuthorization()
            .WithName("CreateMyAddress")
            .WithSummary("Create a new shipping address")
            .WithDescription("Creates a new shipping address for the authenticated customer. If it is the first address, it is automatically marked as default.")
            .Produces<CustomerAddressDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    public static async Task<IResult> Handle(
        CreateAddressRequest request,
        ClaimsPrincipal user,
        CustomerContext db,
        IValidator<CreateAddressRequest> validator,
        CancellationToken ct)
    {
        var customerId = user.GetCustomerId();
        if (customerId is null)
        {
            return Results.Problem("Chưa xác thực người dùng.", statusCode: StatusCodes.Status401Unauthorized);
        }

        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return Results.ValidationProblem(validation.ToDictionary());
        }

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        var customerExists = await db.Customers.AnyAsync(c => c.Id == customerId.Value, ct);
        if (!customerExists)
        {
            db.Customers.Add(new Model.Customer
            {
                Id = customerId.Value,
                Email = user.GetEmail(),
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync(ct);
        }

        var hasAnyAddress = await db.CustomerAddresses.AnyAsync(a => a.CustomerId == customerId.Value, ct);
        var shouldBeDefault = request.IsDefault || !hasAnyAddress;

        if (shouldBeDefault && hasAnyAddress)
        {
            await db.CustomerAddresses
                .Where(a => a.CustomerId == customerId.Value && a.IsDefault)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(a => a.IsDefault, false)
                    .SetProperty(a => a.UpdatedAt, DateTime.UtcNow), ct);
        }

        var address = new CustomerAddress
        {
            Id = Guid.CreateVersion7(),
            CustomerId = customerId.Value,
            ReceiverName = request.ReceiverName.Trim(),
            ReceiverPhone = request.ReceiverPhone.Trim(),
            Province = request.Province.Trim(),
            District = request.District.Trim(),
            Ward = request.Ward.Trim(),
            StreetAddress = request.StreetAddress.Trim(),
            PostalCode = request.PostalCode?.Trim(),
            IsDefault = shouldBeDefault,
            Label = request.Label?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        db.CustomerAddresses.Add(address);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        var dto = CustomerAddressDto.FromEntity(address);
        return Results.Created($"/api/v1/customers/me/addresses/{address.Id}", dto);
    }
}
