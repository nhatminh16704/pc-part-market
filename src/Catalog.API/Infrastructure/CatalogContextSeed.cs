namespace eShop.Catalog.API.Infrastructure;

public partial class CatalogContextSeed(
    IWebHostEnvironment env,
    IOptions<CatalogOptions> settings,
    ILogger<CatalogContextSeed> logger) : IDbSeeder<CatalogContext>
{
    public async Task SeedAsync(CatalogContext context)
    {
        _ = settings.Value;
        var contentRootPath = env.ContentRootPath;

        // Workaround from https://github.com/npgsql/efcore.pg/issues/292#issuecomment-388608426
        context.Database.OpenConnection();
        ((NpgsqlConnection)context.Database.GetDbConnection()).ReloadTypes();

        if (!await context.Products.AnyAsync())
        {
            var sqlFile = Path.Combine(contentRootPath, "Setup", "seed_data.sql");
            if (!File.Exists(sqlFile))
            {
                sqlFile = Path.Combine(AppContext.BaseDirectory, "Setup", "seed_data.sql");
            }
            if (!File.Exists(sqlFile))
            {
                sqlFile = Path.Combine(contentRootPath, "seed_data.sql");
            }

            if (File.Exists(sqlFile))
            {
                logger.LogInformation("Seeding PC part catalog from {SqlFile}", sqlFile);
                var sql = await File.ReadAllTextAsync(sqlFile);
                await context.Database.ExecuteSqlRawAsync(sql);
                logger.LogInformation("Successfully seeded PC part catalog.");

                var normFile = Path.Combine(contentRootPath, "Setup", "specs_normalized.sql");
                if (!File.Exists(normFile))
                {
                    normFile = Path.Combine(AppContext.BaseDirectory, "Setup", "specs_normalized.sql");
                }
                if (!File.Exists(normFile))
                {
                    normFile = Path.Combine(contentRootPath, "specs_normalized.sql");
                }
                if (File.Exists(normFile))
                {
                    logger.LogInformation("Applying normalized specs from {NormFile}", normFile);
                    var normSql = await File.ReadAllTextAsync(normFile);
                    await context.Database.ExecuteSqlRawAsync(normSql);
                    logger.LogInformation("Successfully applied normalized specs.");
                }
            }
            else
            {
                logger.LogWarning("Seed data file seed_data.sql not found at {ContentRootPath}", contentRootPath);
            }
        }
    }
}
