using eShop.Customer.API.Infrastructure;
using eShop.ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.AddNpgsqlDbContext<CustomerContext>("customerdb");

var app = builder.Build();

app.MapDefaultEndpoints();

app.Run();
