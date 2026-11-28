#nullable enable

namespace eShop.Ordering.API.Infrastructure.Repositories;

public interface ICheckoutSessionRepository
{
    Task<CheckoutSession?> GetAsync(Guid sessionId, CancellationToken cancellationToken = default);
    Task<CheckoutSession?> SaveAsync(CheckoutSession session, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid sessionId, CancellationToken cancellationToken = default);
}

