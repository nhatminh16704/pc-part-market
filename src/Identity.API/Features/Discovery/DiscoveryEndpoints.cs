#nullable enable

using eShop.Identity.API.Services;

namespace eShop.Identity.API.Features.Discovery;

public static class DiscoveryEndpoints
{
    public static RouteGroupBuilder MapDiscoveryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("");

        group.MapGet("/.well-known/openid-configuration", (
            HttpContext context,
            IConfiguration configuration) =>
        {
            var issuer = GetBaseUrl(context, configuration);
            var jwksUri = $"{issuer}/.well-known/openid-configuration/jwks";

            return Results.Ok(new
            {
                issuer = issuer,
                jwks_uri = jwksUri,
                authorization_endpoint = $"{issuer}/connect/authorize",
                token_endpoint = $"{issuer}/api/auth/login",
                userinfo_endpoint = $"{issuer}/api/auth/me",
                response_types_supported = new[] { "token", "id_token" },
                subject_types_supported = new[] { "public" },
                id_token_signing_alg_values_supported = new[] { "RS256" },
                scopes_supported = new[] { "openid", "profile", "email", "basket", "orders", "webhooks" },
                token_endpoint_auth_methods_supported = new[] { "client_secret_post", "client_secret_basic" },
                claims_supported = new[] { "sub", "email", "preferred_username", "status", "role" }
            });
        })
        .WithName("OpenIdConfiguration")
        .WithSummary("OpenID Connect Discovery Document")
        .AllowAnonymous();

        group.MapGet("/.well-known/openid-configuration/jwks", (RsaKeyManager rsaKeyManager) =>
        {
            var jwk = rsaKeyManager.GetPublicJsonWebKey();
            return Results.Ok(new { keys = new[] { jwk } });
        })
        .WithName("Jwks")
        .WithSummary("JSON Web Key Set")
        .AllowAnonymous();

        group.MapGet("/.well-known/jwks.json", (RsaKeyManager rsaKeyManager) =>
        {
            var jwk = rsaKeyManager.GetPublicJsonWebKey();
            return Results.Ok(new { keys = new[] { jwk } });
        })
        .WithName("JwksJson")
        .WithSummary("JSON Web Key Set (Alias)")
        .AllowAnonymous();

        return group;
    }

    private static string GetBaseUrl(HttpContext context, IConfiguration configuration)
    {
        var configIssuer = configuration["Identity:Url"] ?? configuration["IdentityUrl"];
        if (!string.IsNullOrWhiteSpace(configIssuer))
            return configIssuer.TrimEnd('/');

        return $"{context.Request.Scheme}://{context.Request.Host}".TrimEnd('/');
    }
}
