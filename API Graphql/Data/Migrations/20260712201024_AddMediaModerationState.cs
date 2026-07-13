using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMediaModerationState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsHiddenByModerator",
                schema: "dbo",
                table: "Inquiries",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PreferAttachmentCover",
                schema: "dbo",
                table: "Inquiries",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHiddenByModerator",
                schema: "dbo",
                table: "Comments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Inquiries_IsActive_IsHiddenByModerator_PublishDate",
                schema: "dbo",
                table: "Inquiries",
                columns: new[] { "IsActive", "IsHiddenByModerator", "PublishDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_InquiryId_IsActive_IsHiddenByModerator",
                schema: "dbo",
                table: "Comments",
                columns: new[] { "InquiryId", "IsActive", "IsHiddenByModerator" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Inquiries_IsActive_IsHiddenByModerator_PublishDate",
                schema: "dbo",
                table: "Inquiries");

            migrationBuilder.DropIndex(
                name: "IX_Comments_InquiryId_IsActive_IsHiddenByModerator",
                schema: "dbo",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "IsHiddenByModerator",
                schema: "dbo",
                table: "Inquiries");

            migrationBuilder.DropColumn(
                name: "PreferAttachmentCover",
                schema: "dbo",
                table: "Inquiries");

            migrationBuilder.DropColumn(
                name: "IsHiddenByModerator",
                schema: "dbo",
                table: "Comments");
        }
    }
}
