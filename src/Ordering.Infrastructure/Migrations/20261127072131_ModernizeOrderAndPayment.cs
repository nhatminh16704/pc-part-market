using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordering.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ModernizeOrderAndPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orders_buyers_BuyerId",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_paymentmethods_PaymentMethodId",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropTable(
                name: "paymentmethods",
                schema: "ordering");

            migrationBuilder.DropTable(
                name: "buyers",
                schema: "ordering");

            migrationBuilder.DropTable(
                name: "cardtypes",
                schema: "ordering");

            migrationBuilder.DropIndex(
                name: "IX_orders_BuyerId",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_PaymentMethodId",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_City",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_Country",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_State",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_Street",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_ZipCode",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "BuyerId",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropSequence(
                name: "buyerseq",
                schema: "ordering");

            migrationBuilder.DropSequence(
                name: "paymentseq",
                schema: "ordering");

            migrationBuilder.AddColumn<string>(
                name: "Address_District",
                schema: "ordering",
                table: "orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Address_PostalCode",
                schema: "ordering",
                table: "orders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_Province",
                schema: "ordering",
                table: "orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Address_ReceiverName",
                schema: "ordering",
                table: "orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Address_ReceiverPhone",
                schema: "ordering",
                table: "orders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Address_StreetAddress",
                schema: "ordering",
                table: "orders",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Address_Ward",
                schema: "ordering",
                table: "orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                schema: "ordering",
                table: "orders",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                schema: "ordering",
                table: "orders",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                schema: "ordering",
                table: "orders",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<long>(
                name: "UnitPrice",
                schema: "ordering",
                table: "orderItems",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "ProductName",
                schema: "ordering",
                table: "orderItems",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.DropColumn(
                name: "ProductId",
                schema: "ordering",
                table: "orderItems");

            migrationBuilder.AddColumn<Guid>(
                name: "ProductId",
                schema: "ordering",
                table: "orderItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<long>(
                name: "Discount",
                schema: "ordering",
                table: "orderItems",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AddColumn<string>(
                name: "Sku",
                schema: "ordering",
                table: "orderItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "VariantId",
                schema: "ordering",
                table: "orderItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "ix_orders_customer_id",
                schema: "ordering",
                table: "orders",
                column: "CustomerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_orders_customer_id",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_District",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_PostalCode",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_Province",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_ReceiverName",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_ReceiverPhone",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_StreetAddress",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Address_Ward",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                schema: "ordering",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Sku",
                schema: "ordering",
                table: "orderItems");

            migrationBuilder.DropColumn(
                name: "VariantId",
                schema: "ordering",
                table: "orderItems");

            migrationBuilder.CreateSequence(
                name: "buyerseq",
                schema: "ordering",
                incrementBy: 10);

            migrationBuilder.CreateSequence(
                name: "paymentseq",
                schema: "ordering",
                incrementBy: 10);

            migrationBuilder.AddColumn<string>(
                name: "Address_City",
                schema: "ordering",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_Country",
                schema: "ordering",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_State",
                schema: "ordering",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_Street",
                schema: "ordering",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_ZipCode",
                schema: "ordering",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BuyerId",
                schema: "ordering",
                table: "orders",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethodId",
                schema: "ordering",
                table: "orders",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitPrice",
                schema: "ordering",
                table: "orderItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<string>(
                name: "ProductName",
                schema: "ordering",
                table: "orderItems",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.DropColumn(
                name: "ProductId",
                schema: "ordering",
                table: "orderItems");

            migrationBuilder.AddColumn<int>(
                name: "ProductId",
                schema: "ordering",
                table: "orderItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<decimal>(
                name: "Discount",
                schema: "ordering",
                table: "orderItems",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.CreateTable(
                name: "buyers",
                schema: "ordering",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    IdentityGuid = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_buyers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "cardtypes",
                schema: "ordering",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cardtypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "paymentmethods",
                schema: "ordering",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    CardTypeId = table.Column<int>(type: "integer", nullable: false),
                    BuyerId = table.Column<int>(type: "integer", nullable: false),
                    Alias = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CardHolderName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CardNumber = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    Expiration = table.Column<DateTime>(type: "timestamp with time zone", maxLength: 25, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_paymentmethods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_paymentmethods_buyers_BuyerId",
                        column: x => x.BuyerId,
                        principalSchema: "ordering",
                        principalTable: "buyers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_paymentmethods_cardtypes_CardTypeId",
                        column: x => x.CardTypeId,
                        principalSchema: "ordering",
                        principalTable: "cardtypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_orders_BuyerId",
                schema: "ordering",
                table: "orders",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_orders_PaymentMethodId",
                schema: "ordering",
                table: "orders",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_buyers_IdentityGuid",
                schema: "ordering",
                table: "buyers",
                column: "IdentityGuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_paymentmethods_BuyerId",
                schema: "ordering",
                table: "paymentmethods",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_paymentmethods_CardTypeId",
                schema: "ordering",
                table: "paymentmethods",
                column: "CardTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_buyers_BuyerId",
                schema: "ordering",
                table: "orders",
                column: "BuyerId",
                principalSchema: "ordering",
                principalTable: "buyers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_paymentmethods_PaymentMethodId",
                schema: "ordering",
                table: "orders",
                column: "PaymentMethodId",
                principalSchema: "ordering",
                principalTable: "paymentmethods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
