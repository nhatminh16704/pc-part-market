using System.Text.Json.Serialization;

namespace eShop.ServiceDefaults;

public class ApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("statusCode")]
    public int StatusCode { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    [JsonPropertyName("errors")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<string>? Errors { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Success", int statusCode = 200) => new()
    {
        Success = true,
        StatusCode = statusCode,
        Message = message,
        Data = data
    };

    public static ApiResponse<T> Fail(string message, int statusCode = 400, List<string>? errors = null) => new()
    {
        Success = false,
        StatusCode = statusCode,
        Message = message,
        Errors = errors
    };
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse SuccessResult(string message = "Success", int statusCode = 200) => new()
    {
        Success = true,
        StatusCode = statusCode,
        Message = message,
        Data = null
    };

    public static ApiResponse FailureResult(string message, int statusCode = 400, List<string>? errors = null) => new()
    {
        Success = false,
        StatusCode = statusCode,
        Message = message,
        Errors = errors
    };
}
