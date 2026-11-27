namespace eShop.Ordering.API.Application.Validations;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator(ILogger<CreateOrderCommandValidator> logger)
    {
        RuleFor(command => command.CustomerId).NotEmpty();
        RuleFor(command => command.ReceiverName).NotEmpty().MaximumLength(100);
        RuleFor(command => command.ReceiverPhone).NotEmpty().MaximumLength(20);
        RuleFor(command => command.Province).NotEmpty().MaximumLength(100);
        RuleFor(command => command.District).NotEmpty().MaximumLength(100);
        RuleFor(command => command.Ward).NotEmpty().MaximumLength(100);
        RuleFor(command => command.StreetAddress).NotEmpty().MaximumLength(255);
        RuleFor(command => command.PaymentMethod).IsInEnum();
        RuleFor(command => command.OrderItems).Must(ContainOrderItems).WithMessage("No order items found");

        if (logger.IsEnabled(LogLevel.Trace))
        {
            logger.LogTrace("INSTANCE CREATED - {ClassName}", GetType().Name);
        }
    }

    private bool ContainOrderItems(IEnumerable<OrderItemDTO> orderItems)
    {
        return orderItems.Any();
    }
}
