using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAcademicModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AcademicProgress",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    AssignedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    Disabled = table.Column<bool>(type: "bit", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModificationUser = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicProgress", x => x.Id);
                    table.CheckConstraint("CK_AcademicProgress_Score", "[Score] IS NULL OR ([Score] >= 0 AND [Score] <= 10)");
                    table.ForeignKey(
                        name: "FK_AcademicProgress_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalSchema: "dbo",
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AcademicProgress_Users_AssignedById",
                        column: x => x.AssignedById,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AcademicProgress_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AcademicResources",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    UploaderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ExternalUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ResourceType = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Disabled = table.Column<bool>(type: "bit", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModificationUser = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicResources", x => x.Id);
                    table.CheckConstraint("CK_AcademicResources_Content", "([FileUrl] IS NOT NULL AND LEN([FileUrl]) > 0) OR ([ExternalUrl] IS NOT NULL AND LEN([ExternalUrl]) > 0)");
                    table.ForeignKey(
                        name: "FK_AcademicResources_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalSchema: "dbo",
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AcademicResources_Users_UploaderId",
                        column: x => x.UploaderId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AcademicProgress_AssignedById",
                schema: "dbo",
                table: "AcademicProgress",
                column: "AssignedById");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicProgress_SubjectId",
                schema: "dbo",
                table: "AcademicProgress",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicProgress_UpdatedAt",
                schema: "dbo",
                table: "AcademicProgress",
                column: "UpdatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicProgress_UserId_SubjectId",
                schema: "dbo",
                table: "AcademicProgress",
                columns: new[] { "UserId", "SubjectId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AcademicResources_CreatedAt",
                schema: "dbo",
                table: "AcademicResources",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicResources_SubjectId",
                schema: "dbo",
                table: "AcademicResources",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicResources_SubjectId_IsActive_CreatedAt",
                schema: "dbo",
                table: "AcademicResources",
                columns: new[] { "SubjectId", "IsActive", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AcademicResources_UploaderId",
                schema: "dbo",
                table: "AcademicResources",
                column: "UploaderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AcademicProgress",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "AcademicResources",
                schema: "dbo");
        }
    }
}
