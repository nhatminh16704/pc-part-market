using System.Text.Json;

namespace eShop.Ordering.UnitTests.Application;

[TestClass]
public class SetStockRejectedOrderStatusCommandTest
{
    [TestMethod]
    public void Set_Stock_Rejected_OrderStatusCommand_Check_Serialization()
    {
        var command = new SetStockRejectedOrderStatusCommand(123, [Guid.NewGuid(), Guid.NewGuid()]);

        var json = JsonSerializer.Serialize(command);
        var deserializedCommand = JsonSerializer.Deserialize<SetStockRejectedOrderStatusCommand>(json);

        Assert.AreEqual(command.OrderNumber, deserializedCommand.OrderNumber);
        Assert.IsNotNull(deserializedCommand.OrderStockItems);
        Assert.HasCount(command.OrderStockItems.Count, deserializedCommand.OrderStockItems);

        for (int i = 0; i < command.OrderStockItems.Count; i++)
        {
            Assert.AreEqual(command.OrderStockItems[i], deserializedCommand.OrderStockItems[i]);
        }
    }
}
