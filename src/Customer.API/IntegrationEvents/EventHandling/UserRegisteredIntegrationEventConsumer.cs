using eShop.Contracts;
using eShop.Customer.API.Infrastructure;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace eShop.Customer.API.IntegrationEvents.EventHandling;

public class UserRegisteredIntegrationEventConsumer(
    CustomerContext db,
    ILogger<UserRegisteredIntegrationEventConsumer> logger)
    : IConsumer<UserRegisteredIntegrationEvent>
{
    public async Task Consume(ConsumeContext<UserRegisteredIntegrationEvent> context)
    {
        var msg = context.Message;
        var ct = context.CancellationToken;

        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == msg.UserId, ct);

        if (customer is null)
        {
            customer = new Model.Customer
            {
                Id = msg.UserId,
                Email = msg.Email,
                FirstName = msg.FirstName?.Trim(),
                LastName = msg.LastName?.Trim(),
                PhoneNumber = msg.PhoneNumber?.Trim(),
                AvatarUrl = msg.AvatarUrl?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            db.Customers.Add(customer);

            try
            {
                await db.SaveChangesAsync(ct);
                logger.LogInformation("Created customer profile from UserRegisteredIntegrationEvent for {CustomerId}", msg.UserId);
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
            {
                // Fallback HTTP endpoint raced and created the record simultaneously; detach and patch missing fields
                db.Entry(customer).State = EntityState.Detached;
                var existing = await db.Customers.FirstOrDefaultAsync(c => c.Id == msg.UserId, ct);
                if (existing is not null)
                {
                    PatchMissingFields(existing, msg);
                    await db.SaveChangesAsync(ct);
                }
            }
        }
        else
        {
            if (PatchMissingFields(customer, msg))
            {
                await db.SaveChangesAsync(ct);
                logger.LogInformation("Patched missing customer profile fields from UserRegisteredIntegrationEvent for {CustomerId}", msg.UserId);
            }
        }
    }

    private static bool PatchMissingFields(Model.Customer customer, UserRegisteredIntegrationEvent msg)
    {
        var changed = false;

        if (customer.FirstName is null && !string.IsNullOrWhiteSpace(msg.FirstName))
        {
            customer.FirstName = msg.FirstName.Trim();
            changed = true;
        }

        if (customer.LastName is null && !string.IsNullOrWhiteSpace(msg.LastName))
        {
            customer.LastName = msg.LastName.Trim();
            changed = true;
        }

        if (customer.PhoneNumber is null && !string.IsNullOrWhiteSpace(msg.PhoneNumber))
        {
            customer.PhoneNumber = msg.PhoneNumber.Trim();
            changed = true;
        }

        if (customer.AvatarUrl is null && !string.IsNullOrWhiteSpace(msg.AvatarUrl))
        {
            customer.AvatarUrl = msg.AvatarUrl.Trim();
            changed = true;
        }

        if (changed)
        {
            customer.UpdatedAt = DateTime.UtcNow;
        }

        return changed;
    }
}
