using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAcademicSectionsAndRegularity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseSections",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    Term = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseSections_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalSchema: "dbo",
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EnrollmentStandings",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CareerId = table.Column<int>(type: "int", nullable: false),
                    Term = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Source = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SourceReference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ValidFromUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ValidUntilUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevokedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnrollmentStandings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EnrollmentStandings_Careers_CareerId",
                        column: x => x.CareerId,
                        principalSchema: "dbo",
                        principalTable: "Careers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EnrollmentStandings_Users_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SectionEnrollments",
                schema: "dbo",
                columns: table => new
                {
                    SectionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EnrolledAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SectionEnrollments", x => new { x.SectionId, x.StudentId });
                    table.ForeignKey(
                        name: "FK_SectionEnrollments_CourseSections_SectionId",
                        column: x => x.SectionId,
                        principalSchema: "dbo",
                        principalTable: "CourseSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SectionEnrollments_Users_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SectionInstructors",
                schema: "dbo",
                columns: table => new
                {
                    SectionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProfessorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SectionInstructors", x => new { x.SectionId, x.ProfessorId });
                    table.ForeignKey(
                        name: "FK_SectionInstructors_CourseSections_SectionId",
                        column: x => x.SectionId,
                        principalSchema: "dbo",
                        principalTable: "CourseSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SectionInstructors_Users_ProfessorId",
                        column: x => x.ProfessorId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RegularStudentCertificates",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StandingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CareerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Term = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ValidUntil = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegularStudentCertificates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegularStudentCertificates_EnrollmentStandings_StandingId",
                        column: x => x.StandingId,
                        principalSchema: "dbo",
                        principalTable: "EnrollmentStandings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SectionGrades",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SectionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SectionGrades", x => x.Id);
                    table.CheckConstraint("CK_SectionGrades_Score", "[Score] IS NULL OR ([Score] >= 0 AND [Score] <= 10)");
                    table.ForeignKey(
                        name: "FK_SectionGrades_CourseSections_SectionId",
                        column: x => x.SectionId,
                        principalSchema: "dbo",
                        principalTable: "CourseSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SectionGrades_SectionEnrollments_SectionId_StudentId",
                        columns: x => new { x.SectionId, x.StudentId },
                        principalSchema: "dbo",
                        principalTable: "SectionEnrollments",
                        principalColumns: new[] { "SectionId", "StudentId" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SectionGrades_Users_AssignedById",
                        column: x => x.AssignedById,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SectionGrades_Users_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseSections_SubjectId_Term_Code",
                schema: "dbo",
                table: "CourseSections",
                columns: new[] { "SubjectId", "Term", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentStandings_CareerId",
                schema: "dbo",
                table: "EnrollmentStandings",
                column: "CareerId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentStandings_StudentId_CareerId_Term",
                schema: "dbo",
                table: "EnrollmentStandings",
                columns: new[] { "StudentId", "CareerId", "Term" });

            migrationBuilder.CreateIndex(
                name: "IX_RegularStudentCertificates_StandingId",
                schema: "dbo",
                table: "RegularStudentCertificates",
                column: "StandingId");

            migrationBuilder.CreateIndex(
                name: "IX_SectionEnrollments_StudentId",
                schema: "dbo",
                table: "SectionEnrollments",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_SectionGrades_AssignedById",
                schema: "dbo",
                table: "SectionGrades",
                column: "AssignedById");

            migrationBuilder.CreateIndex(
                name: "IX_SectionGrades_SectionId_StudentId",
                schema: "dbo",
                table: "SectionGrades",
                columns: new[] { "SectionId", "StudentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SectionGrades_StudentId",
                schema: "dbo",
                table: "SectionGrades",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_SectionInstructors_ProfessorId",
                schema: "dbo",
                table: "SectionInstructors",
                column: "ProfessorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RegularStudentCertificates",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SectionGrades",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SectionInstructors",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "EnrollmentStandings",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SectionEnrollments",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "CourseSections",
                schema: "dbo");
        }
    }
}
