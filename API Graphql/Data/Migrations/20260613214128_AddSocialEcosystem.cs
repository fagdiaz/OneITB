using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSocialEcosystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "InquiryId",
                schema: "dbo",
                table: "CommunityReports",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE reports
                SET InquiryId = TRY_CONVERT(uniqueidentifier, reports.ContentId)
                FROM dbo.CommunityReports AS reports
                INNER JOIN dbo.Inquiries AS inquiries
                    ON inquiries.Id = TRY_CONVERT(uniqueidentifier, reports.ContentId)
                WHERE reports.ContentType IN ('Post', 'Inquiry');

                DELETE FROM dbo.CommunityReports
                WHERE InquiryId IS NULL;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "InquiryId",
                schema: "dbo",
                table: "CommunityReports",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "ContentId",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.DropColumn(
                name: "ContentType",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.CreateTable(
                name: "Comments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InquiryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentCommentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comments_Comments_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalSchema: "dbo",
                        principalTable: "Comments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Comments_Inquiries_InquiryId",
                        column: x => x.InquiryId,
                        principalSchema: "dbo",
                        principalTable: "Inquiries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Comments_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reactions",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InquiryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reactions_Inquiries_InquiryId",
                        column: x => x.InquiryId,
                        principalSchema: "dbo",
                        principalTable: "Inquiries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reactions_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReports_InquiryId",
                schema: "dbo",
                table: "CommunityReports",
                column: "InquiryId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReports_InquiryId_ReporterId_Status",
                schema: "dbo",
                table: "CommunityReports",
                columns: new[] { "InquiryId", "ReporterId", "Status" },
                unique: true,
                filter: "[Status] = 'Pending'");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReports_Status",
                schema: "dbo",
                table: "CommunityReports",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_InquiryId",
                schema: "dbo",
                table: "Comments",
                column: "InquiryId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ParentCommentId",
                schema: "dbo",
                table: "Comments",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_UserId",
                schema: "dbo",
                table: "Comments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_InquiryId_UserId",
                schema: "dbo",
                table: "Reactions",
                columns: new[] { "InquiryId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_UserId",
                schema: "dbo",
                table: "Reactions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CommunityReports_Inquiries_InquiryId",
                schema: "dbo",
                table: "CommunityReports",
                column: "InquiryId",
                principalSchema: "dbo",
                principalTable: "Inquiries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommunityReports_Inquiries_InquiryId",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.DropTable(
                name: "Comments",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Reactions",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_CommunityReports_InquiryId",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.DropIndex(
                name: "IX_CommunityReports_InquiryId_ReporterId_Status",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.DropIndex(
                name: "IX_CommunityReports_Status",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.DropColumn(
                name: "InquiryId",
                schema: "dbo",
                table: "CommunityReports");

            migrationBuilder.AddColumn<string>(
                name: "ContentId",
                schema: "dbo",
                table: "CommunityReports",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                schema: "dbo",
                table: "CommunityReports",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }
    }
}
