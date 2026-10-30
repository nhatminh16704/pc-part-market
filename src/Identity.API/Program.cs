var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.AddNpgsqlDbContext<ApplicationDbContext>("identitydb");

// Apply database migration automatically.
builder.Services.AddMigration<ApplicationDbContext, UsersSeed>();

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<RsaKeyManager>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

var app = builder.Build();

app.MapDefaultEndpoints();

// Cookie policy for compatibility
app.UseCookiePolicy(new CookiePolicyOptions { MinimumSameSitePolicy = SameSiteMode.Lax });
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

// Map OpenID Discovery & JWKS endpoints
app.MapDiscoveryEndpoints();

// Map REST Auth Minimal APIs (/api/auth/login, /api/auth/register, /api/auth/me)
app.MapAuthEndpoints();

app.Run();
