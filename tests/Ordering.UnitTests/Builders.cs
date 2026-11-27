using eShop.Ordering.Domain.AggregatesModel.OrderAggregate;

namespace eShop.Ordering.UnitTests.Domain;

public class AddressBuilder
{
    public Address Build()
    {
        return new Address("Minh", "0912345678", "Ha Noi", "Cau Giay", "Dich Vong", "123 Xuan Thuy");
    }
}

public class OrderBuilder
{
    private readonly Order order;

    public OrderBuilder(Address address)
    {
        order = new Order(Guid.NewGuid(), address, PaymentMethod.COD);
    }

    public OrderBuilder AddOne(
        Guid productId,
        Guid variantId,
        string sku,
        string productName,
        long unitPrice,
        long discount,
        string pictureUrl,
        int units = 1)
    {
        order.AddOrderItem(productId, variantId, sku, productName, unitPrice, discount, pictureUrl, units);
        return this;
    }

    public Order Build()
    {
        return order;
    }
}
