#nullable enable

using Microsoft.AspNetCore.Http.HttpResults;

public static class CheckoutSessionsApi
{
    public static RouteGroupBuilder MapCheckoutSessionsApiV1(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("api/v1/checkout-sessions").HasApiVersion(1.0);

        api.MapPost("/", CreateCheckoutSessionAsync);
        api.MapGet("{id:guid}", GetCheckoutSessionAsync);
        api.MapPatch("{id:guid}", UpdateCheckoutSessionAsync);
        api.MapPost("{id:guid}/confirm", ConfirmCheckoutSessionAsync);

        return api;
    }

    public static async Task<Results<Created<CheckoutSession>, BadRequest<string>, ProblemHttpResult>> CreateCheckoutSessionAsync(
        CreateCheckoutSessionRequest request,
        ICheckoutSessionRepository sessionRepository,
        ICatalogApiClient catalogClient,
        IIdentityService identityService,
        ILogger<CheckoutSession> logger,
        CancellationToken cancellationToken)
    {
        if (!TryGetCustomerId(identityService, out var customerId))
        {
            return TypedResults.BadRequest("Invalid customer identity.");
        }

        if (request.Items is null || request.Items.Count == 0)
        {
            return TypedResults.BadRequest("At least one item is required.");
        }

        var mergedItems = request.Items
            .GroupBy(i => i.VariantId)
            .Select(g => new CreateCheckoutItemRequest(g.Key, g.Sum(x => x.Quantity)))
            .ToList();

        if (mergedItems.Any(i => i.VariantId == Guid.Empty || i.Quantity < 1))
        {
            return TypedResults.BadRequest("Each item must have a valid VariantId and Quantity >= 1.");
        }

        var checkoutItems = new List<CheckoutItem>(mergedItems.Count);
        var productCache = new Dictionary<Guid, CatalogProductDto?>();

        foreach (var item in mergedItems)
        {
            var variant = await catalogClient.GetVariantAsync(item.VariantId, cancellationToken);
            if (variant is null)
            {
                return TypedResults.BadRequest($"Variant {item.VariantId} was not found.");
            }

            if (variant.Quantity < item.Quantity)
            {
                return TypedResults.BadRequest($"Insufficient stock for SKU '{variant.Sku}'. Available: {variant.Quantity}, requested: {item.Quantity}.");
            }

            if (!productCache.TryGetValue(variant.ProductId, out var product))
            {
                product = await catalogClient.GetProductAsync(variant.ProductId, cancellationToken);
                productCache[variant.ProductId] = product;
            }

            var productName = product?.Name ?? variant.Sku;
            if (!string.IsNullOrWhiteSpace(variant.Model))
            {
                productName = $"{productName} ({variant.Model})";
            }

            checkoutItems.Add(new CheckoutItem
            {
                ProductId = variant.ProductId,
                VariantId = variant.Id,
                Sku = variant.Sku,
                ProductName = productName,
                PictureUrl = variant.ImageUrl,
                UnitPrice = variant.Price,
                Quantity = item.Quantity
            });
        }

        var session = new CheckoutSession
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            Source = request.Source,
            Items = checkoutItems,
            PaymentMethod = PaymentMethod.COD,
            CreatedAt = DateTime.UtcNow
        };
        session.RecalculateTotals();

        var saved = await sessionRepository.SaveAsync(session, cancellationToken);
        if (saved is null)
        {
            return TypedResults.Problem(title: "Failed to persist checkout session.", statusCode: StatusCodes.Status500InternalServerError);
        }

        logger.LogInformation("Created checkout session {SessionId} for customer {CustomerId} ({Source}, {ItemCount} items)",
            saved.Id, customerId, saved.Source, saved.Items.Count);

        return TypedResults.Created($"/api/v1/checkout-sessions/{saved.Id}", saved);
    }

    public static async Task<Results<Ok<CheckoutSession>, NotFound<string>, ForbidHttpResult, BadRequest<string>>> GetCheckoutSessionAsync(
        Guid id,
        ICheckoutSessionRepository sessionRepository,
        IIdentityService identityService,
        CancellationToken cancellationToken)
    {
        if (!TryGetCustomerId(identityService, out var customerId))
        {
            return TypedResults.BadRequest("Invalid customer identity.");
        }

        var session = await sessionRepository.GetAsync(id, cancellationToken);
        if (session is null)
        {
            return TypedResults.NotFound("Checkout session not found or expired.");
        }

        if (session.CustomerId != customerId)
        {
            return TypedResults.Forbid();
        }

        return TypedResults.Ok(session);
    }

    public static async Task<Results<Ok<CheckoutSession>, NotFound<string>, ForbidHttpResult, BadRequest<string>, ProblemHttpResult>> UpdateCheckoutSessionAsync(
        Guid id,
        UpdateCheckoutSessionRequest request,
        ICheckoutSessionRepository sessionRepository,
        IIdentityService identityService,
        CancellationToken cancellationToken)
    {
        if (!TryGetCustomerId(identityService, out var customerId))
        {
            return TypedResults.BadRequest("Invalid customer identity.");
        }

        var session = await sessionRepository.GetAsync(id, cancellationToken);
        if (session is null)
        {
            return TypedResults.NotFound("Checkout session not found or expired.");
        }

        if (session.CustomerId != customerId)
        {
            return TypedResults.Forbid();
        }

        if (request.ShippingAddress is not null)
        {
            session.ShippingAddress = request.ShippingAddress;
        }

        if (request.PaymentMethod.HasValue)
        {
            session.PaymentMethod = request.PaymentMethod.Value;
        }

        if (request.VoucherCode is not null)
        {
            session.VoucherCode = string.IsNullOrWhiteSpace(request.VoucherCode) ? null : request.VoucherCode.Trim();
        }

        if (request.Note is not null)
        {
            session.Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();
        }

        session.RecalculateTotals();

        var saved = await sessionRepository.SaveAsync(session, cancellationToken);
        if (saved is null)
        {
            return TypedResults.Problem(title: "Failed to update checkout session.", statusCode: StatusCodes.Status500InternalServerError);
        }

        return TypedResults.Ok(saved);
    }

    public static async Task<Results<Ok<ConfirmCheckoutResponse>, NotFound<string>, ForbidHttpResult, BadRequest<string>, ProblemHttpResult>> ConfirmCheckoutSessionAsync(
        Guid id,
        [FromHeader(Name = "x-requestid")] Guid requestId,
        ICheckoutSessionRepository sessionRepository,
        [AsParameters] OrderServices services,
        CancellationToken cancellationToken)
    {
        if (requestId == Guid.Empty)
        {
            return TypedResults.BadRequest("RequestId is missing.");
        }

        if (!TryGetCustomerId(services.IdentityService, out var customerId))
        {
            return TypedResults.BadRequest("Invalid customer identity.");
        }

        var session = await sessionRepository.GetAsync(id, cancellationToken);
        if (session is null)
        {
            return TypedResults.NotFound("Checkout session not found or expired.");
        }

        if (session.CustomerId != customerId)
        {
            return TypedResults.Forbid();
        }

        var addr = session.ShippingAddress;
        if (addr is null ||
            string.IsNullOrWhiteSpace(addr.ReceiverName) ||
            string.IsNullOrWhiteSpace(addr.ReceiverPhone) ||
            string.IsNullOrWhiteSpace(addr.Province) ||
            string.IsNullOrWhiteSpace(addr.District) ||
            string.IsNullOrWhiteSpace(addr.Ward) ||
            string.IsNullOrWhiteSpace(addr.StreetAddress))
        {
            return TypedResults.BadRequest("Complete shipping address is required before confirming the order.");
        }

        var basketItems = session.Items.Select(item => new BasketItem
        {
            ProductId = item.ProductId,
            VariantId = item.VariantId,
            Sku = item.Sku,
            ProductName = item.ProductName,
            PictureUrl = item.PictureUrl,
            UnitPrice = item.UnitPrice,
            OldUnitPrice = item.UnitPrice,
            Quantity = item.Quantity
        }).ToList();

        var orderedVariantIds = session.Source == CheckoutSource.BASKET
            ? session.Items.Select(i => i.VariantId).Distinct().ToList()
            : null;

        var createOrderCommand = new CreateOrderCommand(
            basketItems,
            customerId,
            addr.ReceiverName,
            addr.ReceiverPhone,
            addr.Province,
            addr.District,
            addr.Ward,
            addr.StreetAddress,
            addr.PostalCode,
            session.PaymentMethod,
            session.Note,
            clearBasket: session.Source == CheckoutSource.BASKET,
            orderedVariantIds: orderedVariantIds);

        var identifiedCommand = new IdentifiedCommand<CreateOrderCommand, bool>(createOrderCommand, requestId);
        var succeeded = await services.Mediator.Send(identifiedCommand, cancellationToken);

        if (!succeeded)
        {
            return TypedResults.Problem(title: "Failed to create order from checkout session.", statusCode: StatusCodes.Status500InternalServerError);
        }

        await sessionRepository.DeleteAsync(id, cancellationToken);

        var orders = await services.Queries.GetOrdersFromUserAsync(customerId);
        var latestOrder = orders.FirstOrDefault();

        return TypedResults.Ok(new ConfirmCheckoutResponse(
            latestOrder?.OrderId ?? 0,
            latestOrder?.OrderNumber ?? string.Empty));
    }

    private static bool TryGetCustomerId(IIdentityService identityService, out Guid customerId)
    {
        var userId = identityService.GetUserIdentity();
        return Guid.TryParse(userId, out customerId) && customerId != Guid.Empty;
    }
}

public record CreateCheckoutSessionRequest(
    CheckoutSource Source,
    List<CreateCheckoutItemRequest> Items);

public record CreateCheckoutItemRequest(
    Guid VariantId,
    int Quantity);

public record UpdateCheckoutSessionRequest(
    CheckoutShippingAddress? ShippingAddress,
    PaymentMethod? PaymentMethod,
    string? VoucherCode,
    string? Note);

public record ConfirmCheckoutResponse(
    int OrderId,
    string OrderNumber);

