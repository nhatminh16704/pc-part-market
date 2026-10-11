using System.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace eShop.Shared.Common;

public class ApiResponseProblemDetailsWriter : IProblemDetailsWriter
{
    public bool CanWrite(ProblemDetailsContext context) => true;

    public async ValueTask WriteAsync(ProblemDetailsContext context)
    {
        var httpContext = context.HttpContext;
        var problemDetails = context.ProblemDetails;
        var statusCode = problemDetails.Status ?? httpContext.Response.StatusCode;
        if (statusCode == 0)
        {
            statusCode = StatusCodes.Status500InternalServerError;
        }

        var traceId = Activity.Current?.TraceId.ToString() ?? httpContext.TraceIdentifier;

        var message = problemDetails.Detail 
            ?? problemDetails.Title 
            ?? (statusCode switch
            {
                StatusCodes.Status400BadRequest => "Bad Request",
                StatusCodes.Status401Unauthorized => "Unauthorized",
                StatusCodes.Status403Forbidden => "Forbidden",
                StatusCodes.Status404NotFound => "Not Found",
                StatusCodes.Status405MethodNotAllowed => "Method Not Allowed",
                StatusCodes.Status409Conflict => "Conflict",
                StatusCodes.Status500InternalServerError => "Internal Server Error",
                _ => "An error occurred"
            });

        List<string>? errors = null;
        if (problemDetails is HttpValidationProblemDetails validationProblemDetails && validationProblemDetails.Errors.Count > 0)
        {
            errors = validationProblemDetails.Errors
                .SelectMany(kv => kv.Value.Select(err => string.IsNullOrEmpty(kv.Key) ? err : $"{kv.Key}: {err}"))
                .ToList();
        }
        else if (problemDetails.Extensions.TryGetValue("errors", out var extErrors) && extErrors is IEnumerable<string> strErrors)
        {
            errors = strErrors.ToList();
        }

        var response = ApiResponse.FailureResult(
            message: message,
            statusCode: statusCode,
            errors: errors,
            traceId: traceId
        );

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        await httpContext.Response.WriteAsJsonAsync(response, httpContext.RequestAborted);
    }
}
