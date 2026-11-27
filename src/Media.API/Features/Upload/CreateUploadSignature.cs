using System.Security.Claims;
using eShop.Media.API.Options;
using eShop.Media.API.Services;
using Microsoft.Extensions.Options;

namespace eShop.Media.API.Features.Upload;

public record CreateUploadSignatureRequest(string Purpose);

public static class CreateUploadSignatureEndpoint
{
    public static RouteHandlerBuilder MapCreateUploadSignature(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPost("/signature", Handle)
            .RequireAuthorization()
            .WithName("CreateUploadSignature")
            .WithSummary("Generate signed upload parameters for Cloudinary")
            .WithDescription("Generates a short-lived Cloudinary upload signature based on the requested purpose (avatar, product, category).")
            .Produces<UploadSignatureResult>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    public static IResult Handle(
        CreateUploadSignatureRequest request,
        ClaimsPrincipal user,
        ICloudinarySignatureService signatureService,
        IOptions<CloudinaryOptions> options)
    {
        if (!options.Value.IsConfigured)
        {
            return Results.Problem(
                "Dịch vụ lưu trữ ảnh (Cloudinary) chưa được cấu hình.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        var userId = user.FindFirst("sub")?.Value
            ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Problem("Chưa xác thực người dùng.", statusCode: StatusCodes.Status401Unauthorized);
        }

        var purpose = request.Purpose?.Trim().ToLowerInvariant();
        var userType = user.FindFirst("user_type")?.Value;
        var isStaffOrAdmin = string.Equals(userType, "STAFF", StringComparison.OrdinalIgnoreCase)
            || string.Equals(userType, "ADMIN", StringComparison.OrdinalIgnoreCase);

        string folder;
        string publicId;
        bool overwrite;

        switch (purpose)
        {
            case "avatar":
                folder = "eshop/avatars";
                publicId = userId;
                overwrite = true;
                break;

            case "product":
                if (!isStaffOrAdmin)
                {
                    return Results.Problem("Chỉ nhân viên hoặc quản trị viên mới có quyền tải ảnh sản phẩm.", statusCode: StatusCodes.Status403Forbidden);
                }
                folder = "eshop/products";
                publicId = Guid.NewGuid().ToString("N");
                overwrite = false;
                break;

            case "category":
                if (!isStaffOrAdmin)
                {
                    return Results.Problem("Chỉ nhân viên hoặc quản trị viên mới có quyền tải ảnh danh mục.", statusCode: StatusCodes.Status403Forbidden);
                }
                folder = "eshop/categories";
                publicId = Guid.NewGuid().ToString("N");
                overwrite = false;
                break;

            default:
                return Results.Problem("Purpose không hợp lệ. Hỗ trợ: avatar, product, category.", statusCode: StatusCodes.Status400BadRequest);
        }

        var result = signatureService.GenerateSignature(folder, publicId, overwrite);
        return Results.Ok(result);
    }
}
