using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCommentReportingAndFilteredIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CommunityReports_InquiryId_ReporterId_Status",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.AddColumn<Guid>(
                name: "CommentId",
                schema: "dbo",
                table: "CommunityReports",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Comments_Id_InquiryId",
                schema: "dbo",
                table: "Comments",
                columns: new[] { "Id", "InquiryId" });

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReports_CommentId",
                schema: "dbo",
                table: "CommunityReports",
                column: "CommentId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReports_CommentId_InquiryId",
                schema: "dbo",
                table: "CommunityReports",
                columns: new[] { "CommentId", "InquiryId" });

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReports_ReporterId_CommentId",
                schema: "dbo",
                table: "CommunityReports",
                columns: new[] { "ReporterId", "CommentId" },
                unique: true,
                filter: "[Status] = 'Pending' AND [CommentId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReports_ReporterId_InquiryId",
                schema: "dbo",
                table: "CommunityReports",
                columns: new[] { "ReporterId", "InquiryId" },
                unique: true,
                filter: "[Status] = 'Pending' AND [CommentId] IS NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_CommunityReports_Comments_CommentId_InquiryId",
                schema: "dbo",
                table: "CommunityReports",
                columns: new[] { "CommentId", "InquiryId" },
                principalSchema: "dbo",
                principalTable: "Comments",
                principalColumns: new[] { "Id", "InquiryId" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommunityReports_Comments_CommentId_InquiryId",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.DropIndex(
                name: "IX_CommunityReports_CommentId",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.DropIndex(
                name: "IX_CommunityReports_CommentId_InquiryId",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.DropIndex(
                name: "IX_CommunityReports_ReporterId_CommentId",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.DropIndex(
                name: "IX_CommunityReports_ReporterId_InquiryId",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Comments_Id_InquiryId",
                schema: "dbo",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "CommentId",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReports_InquiryId_ReporterId_Status",
                schema: "dbo",
                table: "CommunityReports",
                columns: new[] { "InquiryId", "ReporterId", "Status" },
                unique: true,
                filter: "[Status] = 'Pending'");
        }
    }
}
