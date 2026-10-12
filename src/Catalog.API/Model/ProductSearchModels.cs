namespace eShop.Catalog.API.Model;

public class ProductSearchRequest
{
    public string? Keyword { get; set; }
    public string? Category { get; set; }
    public string? Brand { get; set; }
    public long? MinPrice { get; set; }
    public long? MaxPrice { get; set; }
    public Dictionary<string, string>? Specs { get; set; }
    public int PageIndex { get; set; } = 0;
    public int PageSize { get; set; } = 10;
}

public class ProductSearchItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SeoName { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public long Price { get; set; }
    public int Quantity { get; set; }
    public string? ImageUrl { get; set; }
    public string? Specifications { get; set; }
    public string? SpecsNormalized { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = EntityStatus.Active;
}
