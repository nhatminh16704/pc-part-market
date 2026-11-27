using System.Security.Cryptography;
using System.Text;
using eShop.Media.API.Options;
using Microsoft.Extensions.Options;

namespace eShop.Media.API.Services;

public record UploadSignatureResult(
    string CloudName,
    string ApiKey,
    long Timestamp,
    string Signature,
    string Folder,
    string PublicId,
    bool Overwrite
);

public interface ICloudinarySignatureService
{
    UploadSignatureResult GenerateSignature(string folder, string publicId, bool overwrite);
}

public class CloudinarySignatureService(IOptions<CloudinaryOptions> options) : ICloudinarySignatureService
{
    public UploadSignatureResult GenerateSignature(string folder, string publicId, bool overwrite)
    {
        var cfg = options.Value;
        if (!cfg.IsConfigured)
        {
            throw new InvalidOperationException("Cloudinary credentials are not configured.");
        }

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var overwriteStr = overwrite ? "true" : "false";

        // Cloudinary requires parameters sorted alphabetically by key, concatenated as key=value&... + ApiSecret
        var toSign = $"folder={folder}&overwrite={overwriteStr}&public_id={publicId}&timestamp={timestamp}{cfg.ApiSecret}";
        var hashBytes = SHA1.HashData(Encoding.UTF8.GetBytes(toSign));
        var signature = Convert.ToHexStringLower(hashBytes);

        return new UploadSignatureResult(
            CloudName: cfg.CloudName,
            ApiKey: cfg.ApiKey,
            Timestamp: timestamp,
            Signature: signature,
            Folder: folder,
            PublicId: publicId,
            Overwrite: overwrite
        );
    }
}
