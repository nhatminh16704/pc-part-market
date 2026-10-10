namespace eShop.Catalog.API.Model;

public static class EntityStatus
{
    public const string Active = "ACTIVE";
    public const string Inactive = "INACTIVE";
    public const string Deleted = "DELETED";

    public static readonly string[] All = [Active, Inactive, Deleted];
}
