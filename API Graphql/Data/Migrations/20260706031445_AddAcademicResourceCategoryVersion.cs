using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAcademicResourceCategoryVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                schema: "dbo",
                table: "AcademicResources",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: false,
                defaultValue: "Otro");

            migrationBuilder.AddColumn<int>(
                name: "Version",
                schema: "dbo",
                table: "AcademicResources",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_AcademicResources_SubjectId_Category_IsActive_CreatedAt",
                schema: "dbo",
                table: "AcademicResources",
                columns: new[] { "SubjectId", "Category", "IsActive", "CreatedAt" });

            migrationBuilder.AddCheckConstraint(
                name: "CK_AcademicResources_Version",
                schema: "dbo",
                table: "AcademicResources",
                sql: "[Version] >= 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AcademicResources_SubjectId_Category_IsActive_CreatedAt",
                schema: "dbo",
                table: "AcademicResources");

            migrationBuilder.DropCheckConstraint(
                name: "CK_AcademicResources_Version",
                schema: "dbo",
                table: "AcademicResources");

            migrationBuilder.DropColumn(
                name: "Category",
                schema: "dbo",
                table: "AcademicResources");

            migrationBuilder.DropColumn(
                name: "Version",
                schema: "dbo",
                table: "AcademicResources");
        }
    }
}
