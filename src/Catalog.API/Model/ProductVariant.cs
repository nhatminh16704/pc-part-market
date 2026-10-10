using System.Text.Json.Serialization;

namespace eShop.Catalog.API.Model;

public class ProductVariant
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid ProductId { get; set; }

    [JsonIgnore]
    public Product Product { get; set; } = null!;

    public long Price { get; set; }
    public int Quantity { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public int WarrantyMonths { get; set; }
    public string? Barcode { get; set; }
    public DateOnly? ReleaseAt { get; set; }
    public string Status { get; set; } = EntityStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
}
