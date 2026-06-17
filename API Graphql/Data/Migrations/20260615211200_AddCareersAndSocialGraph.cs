using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OneItb.Data;

#nullable disable

namespace Data.Migrations
{
    [DbContext(typeof(OneItbContext))]
    [Migration("20260615211200_AddCareersAndSocialGraph")]
    public partial class AddCareersAndSocialGraph : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "dbo",
                table: "Inquiries",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "dbo",
                table: "Inquiries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "dbo",
                table: "Comments",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "dbo",
                table: "Comments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Careers",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModificationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Disabled = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Careers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubjectCareers",
                schema: "dbo",
                columns: table => new
                {
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    CareerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubjectCareers", x => new { x.SubjectId, x.CareerId });
                    table.ForeignKey(
                        name: "FK_SubjectCareers_Careers_CareerId",
                        column: x => x.CareerId,
                        principalSchema: "dbo",
                        principalTable: "Careers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubjectCareers_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalSchema: "dbo",
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserCareers",
                schema: "dbo",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CareerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCareers", x => new { x.UserId, x.CareerId });
                    table.ForeignKey(
                        name: "FK_UserCareers_Careers_CareerId",
                        column: x => x.CareerId,
                        principalSchema: "dbo",
                        principalTable: "Careers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserCareers_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserInteractions",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ObserverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModificationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Disabled = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInteractions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserInteractions_Users_ObserverId",
                        column: x => x.ObserverId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserInteractions_Users_TargetId",
                        column: x => x.TargetId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Inquiries_PublishDate",
                schema: "dbo",
                table: "Inquiries",
                column: "PublishDate");

            migrationBuilder.CreateIndex(
                name: "IX_Careers_Name",
                schema: "dbo",
                table: "Careers",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubjectCareers_CareerId",
                schema: "dbo",
                table: "SubjectCareers",
                column: "CareerId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCareers_CareerId",
                schema: "dbo",
                table: "UserCareers",
                column: "CareerId");

            migrationBuilder.CreateIndex(
                name: "IX_UserInteractions_ObserverId_TargetId",
                schema: "dbo",
                table: "UserInteractions",
                columns: new[] { "ObserverId", "TargetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserInteractions_ObserverId_Type",
                schema: "dbo",
                table: "UserInteractions",
                columns: new[] { "ObserverId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_UserInteractions_TargetId",
                schema: "dbo",
                table: "UserInteractions",
                column: "TargetId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "SubjectCareers", schema: "dbo");
            migrationBuilder.DropTable(name: "UserCareers", schema: "dbo");
            migrationBuilder.DropTable(name: "UserInteractions", schema: "dbo");
            migrationBuilder.DropTable(name: "Careers", schema: "dbo");

            migrationBuilder.DropIndex(name: "IX_Inquiries_PublishDate", schema: "dbo", table: "Inquiries");

            migrationBuilder.DropColumn(name: "IsActive", schema: "dbo", table: "Inquiries");
            migrationBuilder.DropColumn(name: "UpdatedAt", schema: "dbo", table: "Inquiries");
            migrationBuilder.DropColumn(name: "IsActive", schema: "dbo", table: "Comments");
            migrationBuilder.DropColumn(name: "UpdatedAt", schema: "dbo", table: "Comments");
        }
    }
}
