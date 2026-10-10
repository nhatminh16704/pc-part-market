using System.Text.Json.Serialization;

namespace eShop.Catalog.API.Model;

public class Category
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Name { get; set; } = string.Empty;
    public string SeoName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }

    [JsonIgnore]
    public Category? Parent { get; set; }

    public string Status { get; set; } = EntityStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();

    [JsonIgnore]
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
