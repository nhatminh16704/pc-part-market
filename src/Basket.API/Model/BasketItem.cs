using System.ComponentModel.DataAnnotations;

namespace eShop.Basket.API.Model;

public class BasketItem : IValidatableObject
{
    public Guid ProductId { get; set; }
    public Guid VariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? PictureUrl { get; set; }
    public long UnitPrice { get; set; }
    public long OldUnitPrice { get; set; }
    public int Quantity { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var results = new List<ValidationResult>();

        if (ProductId == Guid.Empty)
        {
            results.Add(new ValidationResult("ProductId is required.", [nameof(ProductId)]));
        }

        if (VariantId == Guid.Empty)
        {
            results.Add(new ValidationResult("VariantId is required.", [nameof(VariantId)]));
        }

        if (Quantity < 1)
        {
            results.Add(new ValidationResult("Quantity must be at least 1.", [nameof(Quantity)]));
        }

        return results;
    }
}
