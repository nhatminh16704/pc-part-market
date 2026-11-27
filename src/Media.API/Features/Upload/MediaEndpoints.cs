namespace eShop.Media.API.Features.Upload;

public static class MediaEndpoints
{
    public static IEndpointRouteBuilder MapMediaEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/media")
            .WithTags("Media");

        group.MapCreateUploadSignature();

        return app;
    }
}
