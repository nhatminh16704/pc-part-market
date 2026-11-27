using eShop.Media.API.Features.Upload;
using eShop.Media.API.Options;
using eShop.Media.API.Services;
using eShop.ServiceDefaults;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.AddDefaultAuthentication();
builder.Services.AddAuthorization();

builder.Services.Configure<CloudinaryOptions>(
    builder.Configuration.GetSection(CloudinaryOptions.SectionName));
builder.Services.AddSingleton<ICloudinarySignatureService, CloudinarySignatureService>();

builder.Services.AddOpenApi();

var app = builder.Build();

app.MapDefaultEndpoints();

app.MapOpenApi();
if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference(options => options.DefaultFonts = false);
    app.MapGet("/", () => Results.Redirect("/scalar/v1")).ExcludeFromDescription();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapMediaEndpoints();

app.Run();
