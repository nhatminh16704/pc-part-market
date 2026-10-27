#nullable enable

namespace IdentityServerHost.Quickstart.UI;

[SecurityHeaders]
[AllowAnonymous]
public class AccountController(IConfiguration configuration) : Controller
{
    /// <summary>
    /// If an external client redirects to IdentityServer /Account/Login,
    /// redirect them to the modern React WebApp login page.
    /// </summary>
    [HttpGet]
    public IActionResult Login(string? returnUrl)
    {
        var webAppUrl = configuration["WebAppClient"] ?? "";
        var redirect = string.IsNullOrEmpty(returnUrl)
            ? $"{webAppUrl}/login"
            : $"{webAppUrl}/login?returnUrl={Uri.EscapeDataString(returnUrl)}";

        return Redirect(redirect);
    }

    /// <summary>
    /// Redirect logout flow to the WebApp homepage.
    /// </summary>
    [HttpGet]
    public IActionResult Logout()
    {
        var webAppUrl = configuration["WebAppClient"] ?? "";
        return Redirect($"{webAppUrl}/");
    }
}