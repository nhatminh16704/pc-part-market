#nullable enable

namespace eShop.Identity.API.Models;

public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserId { get; set; } = default!;

    [MaxLength(64)]
    public string TokenHash { get; set; } = default!;

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? RevokedAt { get; set; }

    [MaxLength(64)]
    public string? ReplacedByTokenHash { get; set; }

    // Navigation property
    public ApplicationUser User { get; set; } = default!;

    // Helpers
    public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsRevoked && !IsExpired;
}
