using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAcademicRulesToSubjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CareerId",
                schema: "dbo",
                table: "Subjects",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                schema: "dbo",
                table: "Subjects",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(
                """
                IF EXISTS (SELECT 1 FROM [dbo].[Subjects])
                   AND NOT EXISTS (SELECT 1 FROM [dbo].[Careers])
                BEGIN
                    THROW 51000, 'Cannot migrate subjects because no careers exist.', 1;
                END;

                UPDATE subject
                SET [CareerId] = link.[CareerId]
                FROM [dbo].[Subjects] subject
                CROSS APPLY
                (
                    SELECT TOP (1) subjectCareer.[CareerId]
                    FROM [dbo].[SubjectCareers] subjectCareer
                    WHERE subjectCareer.[SubjectId] = subject.[Id]
                    ORDER BY subjectCareer.[CareerId]
                ) link;

                DECLARE @FallbackCareerId int =
                (
                    SELECT TOP (1) [Id]
                    FROM [dbo].[Careers]
                    ORDER BY [Id]
                );

                UPDATE [dbo].[Subjects]
                SET [CareerId] = @FallbackCareerId
                WHERE [CareerId] IS NULL;
                """);

            migrationBuilder.AlterColumn<int>(
                name: "CareerId",
                schema: "dbo",
                table: "Subjects",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.DropTable(
                name: "SubjectCareers",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "SubjectPrerequisites",
                schema: "dbo",
                columns: table => new
                {
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    PrerequisiteId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubjectPrerequisites", x => new { x.SubjectId, x.PrerequisiteId });
                    table.CheckConstraint("CK_SubjectPrerequisites_NoSelfReference", "[SubjectId] <> [PrerequisiteId]");
                    table.ForeignKey(
                        name: "FK_SubjectPrerequisites_Subjects_PrerequisiteId",
                        column: x => x.PrerequisiteId,
                        principalSchema: "dbo",
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubjectPrerequisites_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalSchema: "dbo",
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_CareerId",
                schema: "dbo",
                table: "Subjects",
                column: "CareerId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Subjects_Year",
                schema: "dbo",
                table: "Subjects",
                sql: "[Year] IS NULL OR ([Year] BETWEEN 1 AND 6)");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectPrerequisites_PrerequisiteId",
                schema: "dbo",
                table: "SubjectPrerequisites",
                column: "PrerequisiteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Subjects_Careers_CareerId",
                schema: "dbo",
                table: "Subjects",
                column: "CareerId",
                principalSchema: "dbo",
                principalTable: "Careers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subjects_Careers_CareerId",
                schema: "dbo",
                table: "Subjects");

            migrationBuilder.DropTable(
                name: "SubjectPrerequisites",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_CareerId",
                schema: "dbo",
                table: "Subjects");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Subjects_Year",
                schema: "dbo",
                table: "Subjects");

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

            migrationBuilder.CreateIndex(
                name: "IX_SubjectCareers_CareerId",
                schema: "dbo",
                table: "SubjectCareers",
                column: "CareerId");

            migrationBuilder.Sql(
                """
                INSERT INTO [dbo].[SubjectCareers] ([SubjectId], [CareerId])
                SELECT [Id], [CareerId]
                FROM [dbo].[Subjects];
                """);

            migrationBuilder.DropColumn(
                name: "CareerId",
                schema: "dbo",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "Year",
                schema: "dbo",
                table: "Subjects");
        }
    }
}
