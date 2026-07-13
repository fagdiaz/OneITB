using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDirectedRepliesAndSocialGraphIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserInteractions_ObserverId_TargetId",
                schema: "dbo",
                table: "UserInteractions");

            migrationBuilder.AddColumn<Guid>(
                name: "ReplyToUserId",
                schema: "dbo",
                table: "Comments",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserInteractions_ObserverId_TargetId_Type",
                schema: "dbo",
                table: "UserInteractions",
                columns: new[] { "ObserverId", "TargetId", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ReplyToUserId",
                schema: "dbo",
                table: "Comments",
                column: "ReplyToUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Users_ReplyToUserId",
                schema: "dbo",
                table: "Comments",
                column: "ReplyToUserId",
                principalSchema: "dbo",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Users_ReplyToUserId",
                schema: "dbo",
                table: "Comments");

            migrationBuilder.DropIndex(
                name: "IX_UserInteractions_ObserverId_TargetId_Type",
                schema: "dbo",
                table: "UserInteractions");

            migrationBuilder.DropIndex(
                name: "IX_Comments_ReplyToUserId",
                schema: "dbo",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "ReplyToUserId",
                schema: "dbo",
                table: "Comments");

            migrationBuilder.CreateIndex(
                name: "IX_UserInteractions_ObserverId_TargetId",
                schema: "dbo",
                table: "UserInteractions",
                columns: new[] { "ObserverId", "TargetId" },
                unique: true);
        }
    }
}
