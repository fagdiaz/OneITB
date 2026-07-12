using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSocialAttachmentsCommentReactionsAndNotificationGrouping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AggregateCount",
                schema: "dbo",
                table: "Notifications",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "GroupKey",
                schema: "dbo",
                table: "Notifications",
                type: "varchar(160)",
                unicode: false,
                maxLength: 160,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RelatedInquiryId",
                schema: "dbo",
                table: "Notifications",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                schema: "dbo",
                table: "Notifications",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "dbo",
                table: "Notifications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CommentReactions",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CommentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentReactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommentReactions_Comments_CommentId",
                        column: x => x.CommentId,
                        principalSchema: "dbo",
                        principalTable: "Comments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CommentReactions_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SocialAttachments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InquiryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CommentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialAttachments", x => x.Id);
                    table.CheckConstraint("CK_SocialAttachments_ExactlyOneOwner", "([InquiryId] IS NOT NULL AND [CommentId] IS NULL) OR ([InquiryId] IS NULL AND [CommentId] IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_SocialAttachments_Comments_CommentId",
                        column: x => x.CommentId,
                        principalSchema: "dbo",
                        principalTable: "Comments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SocialAttachments_Inquiries_InquiryId",
                        column: x => x.InquiryId,
                        principalSchema: "dbo",
                        principalTable: "Inquiries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.Sql(
                """
                UPDATE [dbo].[Notifications]
                SET [UpdatedAt] = [CreatedAt]
                WHERE [UpdatedAt] IS NULL;

                INSERT INTO [dbo].[SocialAttachments]
                    ([Id], [InquiryId], [CommentId], [FileUrl], [OriginalFileName], [ContentType], [Size], [SortOrder], [CreatedAt])
                SELECT
                    NEWID(),
                    inquiry.[Id],
                    NULL,
                    inquiry.[FileUrl],
                    LEFT(
                        CASE
                            WHEN CHARINDEX('/', REVERSE(inquiry.[FileUrl])) > 0
                                THEN RIGHT(inquiry.[FileUrl], CHARINDEX('/', REVERSE(inquiry.[FileUrl])) - 1)
                            ELSE inquiry.[FileUrl]
                        END,
                        255),
                    CASE
                        WHEN LOWER(inquiry.[FileUrl]) LIKE '%.pdf%' THEN 'application/pdf'
                        WHEN LOWER(inquiry.[FileUrl]) LIKE '%.png%' THEN 'image/png'
                        WHEN LOWER(inquiry.[FileUrl]) LIKE '%.jpg%' OR LOWER(inquiry.[FileUrl]) LIKE '%.jpeg%' THEN 'image/jpeg'
                        WHEN LOWER(inquiry.[FileUrl]) LIKE '%.gif%' THEN 'image/gif'
                        WHEN LOWER(inquiry.[FileUrl]) LIKE '%.webp%' THEN 'image/webp'
                        WHEN LOWER(inquiry.[FileUrl]) LIKE '%.mp4%' THEN 'video/mp4'
                        WHEN LOWER(inquiry.[FileUrl]) LIKE '%.webm%' THEN 'video/webm'
                        ELSE 'application/octet-stream'
                    END,
                    0,
                    0,
                    inquiry.[PublishDate]
                FROM [dbo].[Inquiries] AS inquiry
                WHERE inquiry.[FileUrl] IS NOT NULL AND LTRIM(RTRIM(inquiry.[FileUrl])) <> '';

                INSERT INTO [dbo].[SocialAttachments]
                    ([Id], [InquiryId], [CommentId], [FileUrl], [OriginalFileName], [ContentType], [Size], [SortOrder], [CreatedAt])
                SELECT
                    NEWID(),
                    NULL,
                    comment.[Id],
                    comment.[FileUrl],
                    LEFT(
                        CASE
                            WHEN CHARINDEX('/', REVERSE(comment.[FileUrl])) > 0
                                THEN RIGHT(comment.[FileUrl], CHARINDEX('/', REVERSE(comment.[FileUrl])) - 1)
                            ELSE comment.[FileUrl]
                        END,
                        255),
                    CASE
                        WHEN LOWER(comment.[FileUrl]) LIKE '%.pdf%' THEN 'application/pdf'
                        WHEN LOWER(comment.[FileUrl]) LIKE '%.png%' THEN 'image/png'
                        WHEN LOWER(comment.[FileUrl]) LIKE '%.jpg%' OR LOWER(comment.[FileUrl]) LIKE '%.jpeg%' THEN 'image/jpeg'
                        WHEN LOWER(comment.[FileUrl]) LIKE '%.gif%' THEN 'image/gif'
                        WHEN LOWER(comment.[FileUrl]) LIKE '%.webp%' THEN 'image/webp'
                        WHEN LOWER(comment.[FileUrl]) LIKE '%.mp4%' THEN 'video/mp4'
                        WHEN LOWER(comment.[FileUrl]) LIKE '%.webm%' THEN 'video/webm'
                        ELSE 'application/octet-stream'
                    END,
                    0,
                    0,
                    comment.[CreatedAt]
                FROM [dbo].[Comments] AS comment
                WHERE comment.[FileUrl] IS NOT NULL AND LTRIM(RTRIM(comment.[FileUrl])) <> '';
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RelatedInquiryId",
                schema: "dbo",
                table: "Notifications",
                column: "RelatedInquiryId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_GroupKey",
                schema: "dbo",
                table: "Notifications",
                columns: new[] { "UserId", "GroupKey" },
                unique: true,
                filter: "[GroupKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CommentReactions_CommentId_UserId",
                schema: "dbo",
                table: "CommentReactions",
                columns: new[] { "CommentId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CommentReactions_UserId",
                schema: "dbo",
                table: "CommentReactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialAttachments_CommentId_SortOrder",
                schema: "dbo",
                table: "SocialAttachments",
                columns: new[] { "CommentId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_SocialAttachments_FileUrl",
                schema: "dbo",
                table: "SocialAttachments",
                column: "FileUrl");

            migrationBuilder.CreateIndex(
                name: "IX_SocialAttachments_InquiryId_SortOrder",
                schema: "dbo",
                table: "SocialAttachments",
                columns: new[] { "InquiryId", "SortOrder" });

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Inquiries_RelatedInquiryId",
                schema: "dbo",
                table: "Notifications",
                column: "RelatedInquiryId",
                principalSchema: "dbo",
                principalTable: "Inquiries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Inquiries_RelatedInquiryId",
                schema: "dbo",
                table: "Notifications");

            migrationBuilder.DropTable(
                name: "CommentReactions",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SocialAttachments",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_RelatedInquiryId",
                schema: "dbo",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId_GroupKey",
                schema: "dbo",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "AggregateCount",
                schema: "dbo",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "GroupKey",
                schema: "dbo",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "RelatedInquiryId",
                schema: "dbo",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "dbo",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "dbo",
                table: "Notifications");
        }
    }
}
