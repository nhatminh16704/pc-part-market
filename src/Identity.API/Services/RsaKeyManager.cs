using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace eShop.Identity.API.Services;

public class RsaKeyManager
{
    private readonly RsaSecurityKey _signingKey;
    private readonly JsonWebKey _publicJwk;
    private readonly string _keyId;

    public RsaKeyManager(IWebHostEnvironment environment, ILogger<RsaKeyManager> logger)
    {
        var keyPath = Path.Combine(environment.ContentRootPath, "identity_rsa.json");
        RSA rsa;

        if (File.Exists(keyPath))
        {
            try
            {
                var json = File.ReadAllText(keyPath);
                var keyData = JsonSerializer.Deserialize<RsaPersistedKey>(json);
                rsa = RSA.Create();
                rsa.ImportParameters(new RSAParameters
                {
                    D = Convert.FromBase64String(keyData!.D),
                    DP = Convert.FromBase64String(keyData.DP),
                    DQ = Convert.FromBase64String(keyData.DQ),
                    Exponent = Convert.FromBase64String(keyData.Exponent),
                    InverseQ = Convert.FromBase64String(keyData.InverseQ),
                    Modulus = Convert.FromBase64String(keyData.Modulus),
                    P = Convert.FromBase64String(keyData.P),
                    Q = Convert.FromBase64String(keyData.Q)
                });
                _keyId = keyData.KeyId;
                logger.LogInformation("Loaded persisted RSA signing key with KeyId {KeyId}", _keyId);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to load persisted RSA key. Generating a new one.");
                (rsa, _keyId) = GenerateAndPersistNewKey(keyPath, logger);
            }
        }
        else
        {
            (rsa, _keyId) = GenerateAndPersistNewKey(keyPath, logger);
        }

        _signingKey = new RsaSecurityKey(rsa)
        {
            KeyId = _keyId
        };

        // Export only public parameters for JWKS
        var publicParameters = rsa.ExportParameters(false);
        _publicJwk = new JsonWebKey
        {
            Kty = JsonWebAlgorithmsKeyTypes.RSA,
            Use = "sig",
            Kid = _keyId,
            Alg = SecurityAlgorithms.RsaSha256,
            N = Base64UrlEncoder.Encode(publicParameters.Modulus),
            E = Base64UrlEncoder.Encode(publicParameters.Exponent)
        };
    }

    public RsaSecurityKey GetSigningKey() => _signingKey;
    public JsonWebKey GetPublicJsonWebKey() => _publicJwk;
    public string KeyId => _keyId;

    private static (RSA rsa, string keyId) GenerateAndPersistNewKey(string keyPath, ILogger logger)
    {
        var rsa = RSA.Create(2048);
        var keyId = Guid.NewGuid().ToString("N");
        var parameters = rsa.ExportParameters(true);

        var keyData = new RsaPersistedKey
        {
            KeyId = keyId,
            D = Convert.ToBase64String(parameters.D!),
            DP = Convert.ToBase64String(parameters.DP!),
            DQ = Convert.ToBase64String(parameters.DQ!),
            Exponent = Convert.ToBase64String(parameters.Exponent!),
            InverseQ = Convert.ToBase64String(parameters.InverseQ!),
            Modulus = Convert.ToBase64String(parameters.Modulus!),
            P = Convert.ToBase64String(parameters.P!),
            Q = Convert.ToBase64String(parameters.Q!)
        };

        try
        {
            var json = JsonSerializer.Serialize(keyData, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(keyPath, json);
            logger.LogInformation("Generated and persisted new RSA key to {KeyPath} with KeyId {KeyId}", keyPath, keyId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Could not persist RSA key to {KeyPath}", keyPath);
        }

        return (rsa, keyId);
    }

    private class RsaPersistedKey
    {
        public string KeyId { get; set; } = "";
        public string D { get; set; } = "";
        public string DP { get; set; } = "";
        public string DQ { get; set; } = "";
        public string Exponent { get; set; } = "";
        public string InverseQ { get; set; } = "";
        public string Modulus { get; set; } = "";
        public string P { get; set; } = "";
        public string Q { get; set; } = "";
    }
}
