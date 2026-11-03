namespace eShop.Identity.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(b =>
        {
            b.Property(u => u.Status)
                .HasMaxLength(20)
                .HasDefaultValue(UserStatus.Active);

            b.Property(u => u.UserType)
                .HasMaxLength(20)
                .HasDefaultValue(UserTypes.Customer);
        });

        builder.Entity<RefreshToken>(b =>
        {
            b.ToTable("RefreshTokens");

            b.HasKey(t => t.Id);

            b.Property(t => t.TokenHash)
                .HasMaxLength(64)
                .IsRequired();

            b.Property(t => t.ReplacedByTokenHash)
                .HasMaxLength(64);

            b.HasIndex(t => t.TokenHash)
                .IsUnique();

            b.HasIndex(t => t.UserId);

            b.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
