namespace eShop.Identity.API.Models
{
    public static class UserStatus
    {
        public const string Active = "ACTIVE";
        public const string Locked = "LOCKED";
        public const string Banned = "BANNED";
    }

    public static class UserTypes
    {
        public const string Customer = "CUSTOMER"; // Khách mua hàng
        public const string Staff = "STAFF";       // Nhân viên nội bộ
        public const string Admin = "ADMIN";       // Quản trị viên cao nhất
    }

    public class ApplicationUser : IdentityUser
    {
        [MaxLength(20)]
        public string Status { get; set; } = UserStatus.Active;

        [MaxLength(20)]
        public string UserType { get; set; } = UserTypes.Customer;
    }
}
