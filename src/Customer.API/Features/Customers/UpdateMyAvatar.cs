using System.Security.Claims;
using eShop.Customer.API.Extensions;
using eShop.Customer.API.Infrastructure;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Customers;

public record UpdateMyAvatarRequest(string AvatarUrl);

public class UpdateMyAvatarValidator : AbstractValidator<UpdateMyAvatarRequest>
{
    public UpdateMyAvatarValidator()
    {
        RuleFor(x => x.AvatarUrl)
            .NotEmpty().WithMessage("AvatarUrl không được để trống.")
            .MaximumLength(500).WithMessage("AvatarUrl tối đa 500 ký tự.")
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out var uri)
                && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            .WithMessage("AvatarUrl phải là đường dẫn HTTP/HTTPS hợp lệ.");
    }
}

public static class UpdateMyAvatarEndpoint
{
    public static RouteHandlerBuilder MapUpdateMyAvatar(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPatch("/me/avatar", Handle)
            .RequireAuthorization()
            .WithName("UpdateMyAvatar")
            .WithSummary("Update current customer's avatar URL")
            .WithDescription("Updates only the avatar URL of the authenticated customer.")
            .Produces<CustomerProfileDto>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    public static async Task<IResult> Handle(
        UpdateMyAvatarRequest request,
        ClaimsPrincipal user,
        CustomerContext db,
        IValidator<UpdateMyAvatarRequest> validator,
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

        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == customerId.Value, ct);
        if (customer is null)
        {
            customer = new Model.Customer
            {
                Id = customerId.Value,
                Email = user.GetEmail(),
                CreatedAt = DateTime.UtcNow
            };
            db.Customers.Add(customer);
        }

        customer.AvatarUrl = request.AvatarUrl.Trim();
        customer.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return Results.Ok(CustomerProfileDto.FromEntity(customer));
    }
}
