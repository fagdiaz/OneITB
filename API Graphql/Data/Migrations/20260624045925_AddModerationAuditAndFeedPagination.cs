using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddModerationAuditAndFeedPagination : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ModerationAudits",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TargetInquiryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TargetCommentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TargetReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Action = table.Column<string>(type: "varchar(80)", unicode: false, maxLength: 80, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModerationAudits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModerationAudits_Comments_TargetCommentId",
                        column: x => x.TargetCommentId,
                        principalSchema: "dbo",
                        principalTable: "Comments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ModerationAudits_CommunityReports_TargetReportId",
                        column: x => x.TargetReportId,
                        principalSchema: "dbo",
                        principalTable: "CommunityReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ModerationAudits_Inquiries_TargetInquiryId",
                        column: x => x.TargetInquiryId,
                        principalSchema: "dbo",
                        principalTable: "Inquiries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ModerationAudits_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ModerationAudits_Users_TargetUserId",
                        column: x => x.TargetUserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ModerationAudits_ActorUserId",
                schema: "dbo",
                table: "ModerationAudits",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationAudits_CreatedAt",
                schema: "dbo",
                table: "ModerationAudits",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationAudits_TargetCommentId",
                schema: "dbo",
                table: "ModerationAudits",
                column: "TargetCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationAudits_TargetInquiryId",
                schema: "dbo",
                table: "ModerationAudits",
                column: "TargetInquiryId");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationAudits_TargetReportId",
                schema: "dbo",
                table: "ModerationAudits",
                column: "TargetReportId");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationAudits_TargetUserId",
                schema: "dbo",
                table: "ModerationAudits",
                column: "TargetUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ModerationAudits",
                schema: "dbo");
        }
    }
}
