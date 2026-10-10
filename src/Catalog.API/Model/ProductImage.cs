using System.Text.Json.Serialization;

namespace eShop.Catalog.API.Model;

public class ProductImage
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid ProductId { get; set; }

    [JsonIgnore]
    public Product Product { get; set; } = null!;

    public string ImageUrl { get; set; } = string.Empty;
    public bool IsMain { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
