namespace eShop.Basket.API.Model;

public class CustomerBasket
{
    public string BuyerId { get; set; } = string.Empty;

    public List<BasketItem> Items { get; set; } = [];

    public CustomerBasket() { }

    public CustomerBasket(string customerId)
    {
        BuyerId = customerId;
    }
}
