using System.Security.Claims;
using eShop.Customer.API.Extensions;
using eShop.Customer.API.Infrastructure;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Addresses;

public record UpdateAddressRequest(
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

public class UpdateAddressValidator : AbstractValidator<UpdateAddressRequest>
{
    public UpdateAddressValidator()
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

public static class UpdateMyAddressEndpoint
{
    public static RouteHandlerBuilder MapUpdateMyAddress(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPut("/me/addresses/{addressId:guid}", Handle)
            .RequireAuthorization()
            .WithName("UpdateMyAddress")
            .WithSummary("Update an existing shipping address")
            .WithDescription("Updates a shipping address owned by the authenticated customer.")
            .Produces<CustomerAddressDto>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    public static async Task<IResult> Handle(
        Guid addressId,
        UpdateAddressRequest request,
        ClaimsPrincipal user,
        CustomerContext db,
        IValidator<UpdateAddressRequest> validator,
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

        var address = await db.CustomerAddresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.CustomerId == customerId.Value, ct);

        if (address is null)
        {
            return Results.Problem("Không tìm thấy địa chỉ.", statusCode: StatusCodes.Status404NotFound);
        }

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        if (request.IsDefault && !address.IsDefault)
        {
            await db.CustomerAddresses
                .Where(a => a.CustomerId == customerId.Value && a.IsDefault && a.Id != addressId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(a => a.IsDefault, false)
                    .SetProperty(a => a.UpdatedAt, DateTime.UtcNow), ct);
        }

        address.ReceiverName = request.ReceiverName.Trim();
        address.ReceiverPhone = request.ReceiverPhone.Trim();
        address.Province = request.Province.Trim();
        address.District = request.District.Trim();
        address.Ward = request.Ward.Trim();
        address.StreetAddress = request.StreetAddress.Trim();
        address.PostalCode = request.PostalCode?.Trim();
        address.IsDefault = request.IsDefault;
        address.Label = request.Label?.Trim();
        address.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Results.Ok(CustomerAddressDto.FromEntity(address));
    }
}
