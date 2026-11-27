namespace eShop.Ordering.UnitTests.Domain;

using eShop.Ordering.Domain.AggregatesModel.OrderAggregate;

[TestClass]
public class OrderAggregateTest
{
    [TestMethod]
    public void Create_order_item_success()
    {
        var fakeOrderItem = new OrderItem(Guid.NewGuid(), Guid.NewGuid(), "SKU-1", "FakeProductName", 12, 15, "FakeUrl", 5);
        Assert.IsNotNull(fakeOrderItem);
    }

    [TestMethod]
    public void Invalid_number_of_units()
    {
        Assert.ThrowsExactly<OrderingDomainException>(() =>
            new OrderItem(Guid.NewGuid(), Guid.NewGuid(), "SKU-1", "FakeProductName", 12, 15, "FakeUrl", -1));
    }

    [TestMethod]
    public void Invalid_total_of_order_item_lower_than_discount_applied()
    {
        Assert.ThrowsExactly<OrderingDomainException>(() =>
            new OrderItem(Guid.NewGuid(), Guid.NewGuid(), "SKU-1", "FakeProductName", 12, 15, "FakeUrl", 1));
    }

    [TestMethod]
    public void Invalid_discount_setting()
    {
        var fakeOrderItem = new OrderItem(Guid.NewGuid(), Guid.NewGuid(), "SKU-1", "FakeProductName", 12, 15, "FakeUrl", 5);
        Assert.ThrowsExactly<OrderingDomainException>(() => fakeOrderItem.SetNewDiscount(-1));
    }

    [TestMethod]
    public void Invalid_units_setting()
    {
        var fakeOrderItem = new OrderItem(Guid.NewGuid(), Guid.NewGuid(), "SKU-1", "FakeProductName", 12, 15, "FakeUrl", 5);
        Assert.ThrowsExactly<OrderingDomainException>(() => fakeOrderItem.AddUnits(-1));
    }

    [TestMethod]
    public void when_add_two_times_on_the_same_item_then_the_total_of_order_should_be_the_sum_of_the_two_items()
    {
        var productId = Guid.NewGuid();
        var variantId = Guid.NewGuid();
        var address = new AddressBuilder().Build();
        var order = new OrderBuilder(address)
            .AddOne(productId, variantId, "SKU-1", "cup", 10, 0, string.Empty)
            .AddOne(productId, variantId, "SKU-1", "cup", 10, 0, string.Empty)
            .Build();

        Assert.AreEqual(20L, order.GetTotal());
    }

    [TestMethod]
    public void Add_new_Order_raises_new_event()
    {
        var address = new AddressBuilder().Build();
        var fakeOrder = new Order(Guid.NewGuid(), address, PaymentMethod.COD);

        Assert.HasCount(1, fakeOrder.DomainEvents);
    }

    [TestMethod]
    public void Add_event_Order_explicitly_raises_new_event()
    {
        var customerId = Guid.NewGuid();
        var address = new AddressBuilder().Build();
        var fakeOrder = new Order(customerId, address, PaymentMethod.COD);
        fakeOrder.AddDomainEvent(new OrderStartedDomainEvent(fakeOrder, customerId));

        Assert.HasCount(2, fakeOrder.DomainEvents);
    }

    [TestMethod]
    public void Remove_event_Order_explicitly()
    {
        var customerId = Guid.NewGuid();
        var address = new AddressBuilder().Build();
        var fakeOrder = new Order(customerId, address, PaymentMethod.COD);
        var fakeEvent = new OrderStartedDomainEvent(fakeOrder, customerId);

        fakeOrder.AddDomainEvent(fakeEvent);
        fakeOrder.RemoveDomainEvent(fakeEvent);

        Assert.HasCount(1, fakeOrder.DomainEvents);
    }
}
