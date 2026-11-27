using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordering.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderStatusHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "orderstatushistoryseq",
                schema: "ordering",
                incrementBy: 10);

            migrationBuilder.CreateTable(
                name: "orderStatusHistories",
                schema: "ordering",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    FromStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    ToStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ChangedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OrderId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orderStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_orderStatusHistories_orders_OrderId",
                        column: x => x.OrderId,
                        principalSchema: "ordering",
                        principalTable: "orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_orderStatusHistories_OrderId",
                schema: "ordering",
                table: "orderStatusHistories",
                column: "OrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "orderStatusHistories",
                schema: "ordering");

            migrationBuilder.DropSequence(
                name: "orderstatushistoryseq",
                schema: "ordering");
        }
    }
}
