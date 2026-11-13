using eShop.Customer.API.Extensions;
using eShop.ServiceDefaults;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.AddApplicationServices();

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

app.Run();
