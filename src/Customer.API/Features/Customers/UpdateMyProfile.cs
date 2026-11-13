using System.Security.Claims;
using eShop.Customer.API.Extensions;
using eShop.Customer.API.Infrastructure;
using eShop.Customer.API.Model;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace eShop.Customer.API.Features.Customers;

public record UpdateMyProfileRequest(
    string? FirstName,
    string? LastName,
    string? PhoneNumber,
    string? AvatarUrl,
    string? Gender,
    DateOnly? DateOfBirth
);

public class UpdateMyProfileValidator : AbstractValidator<UpdateMyProfileRequest>
{
    private static readonly string[] AllowedGenders = [Gender.Male, Gender.Female, Gender.Other];

    public UpdateMyProfileValidator()
    {
        RuleFor(x => x.FirstName).MaximumLength(100);
        RuleFor(x => x.LastName).MaximumLength(100);
        RuleFor(x => x.PhoneNumber).MaximumLength(20);
        RuleFor(x => x.AvatarUrl).MaximumLength(500);
        RuleFor(x => x.Gender)
            .Must(g => g is null || AllowedGenders.Contains(g.ToUpperInvariant()))
            .WithMessage("Gender must be MALE, FEMALE, or OTHER.");
        RuleFor(x => x.DateOfBirth)
            .LessThan(DateOnly.FromDateTime(DateTime.UtcNow))
            .When(x => x.DateOfBirth.HasValue)
            .WithMessage("DateOfBirth must be in the past.");
    }
}

public static class UpdateMyProfileEndpoint
{
    public static RouteHandlerBuilder MapUpdateMyProfile(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPut("/me", Handle)
            .RequireAuthorization()
            .WithName("UpdateMyProfile")
            .WithSummary("Update current customer profile")
            .WithDescription("Updates (or initializes) the authenticated customer's profile information.")
            .Produces<CustomerProfileDto>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    public static async Task<IResult> Handle(
        UpdateMyProfileRequest request,
        ClaimsPrincipal user,
        CustomerContext db,
        IValidator<UpdateMyProfileRequest> validator,
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

        customer.FirstName = request.FirstName?.Trim();
        customer.LastName = request.LastName?.Trim();
        customer.PhoneNumber = request.PhoneNumber?.Trim();
        customer.AvatarUrl = request.AvatarUrl?.Trim();
        customer.Gender = request.Gender?.Trim().ToUpperInvariant();
        customer.DateOfBirth = request.DateOfBirth;
        customer.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return Results.Ok(CustomerProfileDto.FromEntity(customer));
    }
}
