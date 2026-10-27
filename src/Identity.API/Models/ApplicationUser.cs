namespace eShop.Identity.API.Models
{
    public static class UserStatus
    {
        public const string Active = "ACTIVE";
        public const string Locked = "LOCKED";
        public const string Banned = "BANNED";
    }

    public class ApplicationUser : IdentityUser
    {
        [MaxLength(20)]
        public string Status { get; set; } = UserStatus.Active;
    }
}
