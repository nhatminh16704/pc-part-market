namespace eShop.Catalog.API.Features.Images;

public static class ImagesEndpoints
{
    public static IEndpointRouteBuilder MapImagesEndpoints(this IEndpointRouteBuilder app)
    {
        var vApi = app.NewVersionedApi("Catalog");
        var api = vApi.MapGroup("api/catalog").HasApiVersion(1, 0).HasApiVersion(2, 0);

        api.MapGet("/images/{fileName}", GetImageByFileName)
            .WithName("GetImage")
            .WithSummary("Get image file")
            .WithTags("Images");

        return app;
    }

    public static IResult GetImageByFileName(
        IWebHostEnvironment environment,
        string fileName)
    {
        var path = Path.Combine(environment.ContentRootPath, "Pics", fileName);
        if (!File.Exists(path))
        {
            return Results.NotFound();
        }

        string ext = Path.GetExtension(fileName).ToLowerInvariant();
        string mimeType = ext switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            ".svg" => "image/svg+xml",
            _ => "application/octet-stream"
        };

        return Results.File(path, mimeType, lastModified: File.GetLastWriteTimeUtc(path));
    }
}
