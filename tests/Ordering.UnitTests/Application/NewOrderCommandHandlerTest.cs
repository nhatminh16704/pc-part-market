using eShop.Ordering.API.Application.IntegrationEvents;
using eShop.Ordering.Domain.AggregatesModel.OrderAggregate;

namespace eShop.Ordering.UnitTests.Application;

[TestClass]
public class NewOrderRequestHandlerTest
{
    private readonly IOrderRepository _orderRepositoryMock;
    private readonly IOrderingIntegrationEventService _orderingIntegrationEventService;

    public NewOrderRequestHandlerTest()
    {
        _orderRepositoryMock = Substitute.For<IOrderRepository>();
        _orderingIntegrationEventService = Substitute.For<IOrderingIntegrationEventService>();
    }

    [TestMethod]
    public async Task Handle_return_false_if_order_is_not_persisted()
    {
        var fakeOrderCmd = FakeOrderRequest();

        _orderRepositoryMock.GetAsync(Arg.Any<int>())
            .Returns(Task.FromResult(FakeOrder()));

        _orderRepositoryMock.UnitOfWork.SaveChangesAsync(default)
            .Returns(Task.FromResult(1));

        var loggerMock = Substitute.For<ILogger<CreateOrderCommandHandler>>();
        var handler = new CreateOrderCommandHandler(_orderingIntegrationEventService, _orderRepositoryMock, loggerMock);
        var cltToken = new CancellationToken();
        var result = await handler.Handle(fakeOrderCmd, cltToken);

        Assert.IsFalse(result);
    }

    [TestMethod]
    public void Handle_throws_exception_when_no_customerId()
    {
        var address = new Address("Minh", "0912345678", "Ha Noi", "Cau Giay", "Dich Vong", "123 Xuan Thuy");
        Assert.ThrowsExactly<OrderingDomainException>(() => new Order(Guid.Empty, address, PaymentMethod.COD));
    }

    private Order FakeOrder()
    {
        return new Order(
            Guid.NewGuid(),
            new Address("Minh", "0912345678", "Ha Noi", "Cau Giay", "Dich Vong", "123 Xuan Thuy"),
            PaymentMethod.COD);
    }

    private CreateOrderCommand FakeOrderRequest()
    {
        return new CreateOrderCommand(
            new List<BasketItem>(),
            customerId: Guid.NewGuid(),
            receiverName: "Minh",
            receiverPhone: "0912345678",
            province: "Ha Noi",
            district: "Cau Giay",
            ward: "Dich Vong",
            streetAddress: "123 Xuan Thuy",
            postalCode: null,
            paymentMethod: PaymentMethod.COD);
    }
}
