using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeUserCvTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserCvEducations",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Institution = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Degree = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EndDate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Location = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Disabled = table.Column<bool>(type: "bit", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModificationUser = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCvEducations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCvEducations_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserCvExperiences",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Company = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EndDate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Location = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Disabled = table.Column<bool>(type: "bit", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModificationUser = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCvExperiences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCvExperiences_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserCvLanguages",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Level = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Disabled = table.Column<bool>(type: "bit", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModificationUser = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCvLanguages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCvLanguages_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserCvProjects",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EndDate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Url = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Disabled = table.Column<bool>(type: "bit", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModificationUser = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCvProjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCvProjects_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserCvSkills",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Level = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Disabled = table.Column<bool>(type: "bit", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreationUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModificationUser = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCvSkills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCvSkills_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCvEducations_UserId_SortOrder",
                schema: "dbo",
                table: "UserCvEducations",
                columns: new[] { "UserId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_UserCvExperiences_UserId_SortOrder",
                schema: "dbo",
                table: "UserCvExperiences",
                columns: new[] { "UserId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_UserCvLanguages_UserId_SortOrder",
                schema: "dbo",
                table: "UserCvLanguages",
                columns: new[] { "UserId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_UserCvProjects_UserId_SortOrder",
                schema: "dbo",
                table: "UserCvProjects",
                columns: new[] { "UserId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_UserCvSkills_UserId_SortOrder",
                schema: "dbo",
                table: "UserCvSkills",
                columns: new[] { "UserId", "SortOrder" });

            migrationBuilder.Sql(@"
IF COL_LENGTH('dbo.Users', 'CvDataJson') IS NOT NULL
BEGIN
    INSERT INTO dbo.UserCvExperiences
        (Id, UserId, Company, Role, StartDate, EndDate, Location, Description, IsHidden, SortOrder, Disabled, CreationDate, ModificationDate, CreationUser, ModificationUser)
    SELECT
        NEWID(),
        u.Id,
        LEFT(COALESCE(NULLIF(j.Company, N''), N'Experiencia academica'), 200),
        LEFT(COALESCE(NULLIF(j.Role, N''), N'Rol academico'), 200),
        NULLIF(LEFT(COALESCE(j.StartDate, N''), 50), N''),
        NULLIF(LEFT(COALESCE(j.EndDate, N''), 50), N''),
        NULLIF(LEFT(COALESCE(j.Location, N''), 150), N''),
        NULLIF(LEFT(COALESCE(j.Description, N''), 2000), N''),
        COALESCE(j.Hidden, CONVERT(bit, 0)),
        COALESCE(TRY_CONVERT(int, e.[key]), 0),
        CONVERT(bit, 0),
        SYSUTCDATETIME(),
        SYSUTCDATETIME(),
        N'Migration',
        N'Migration'
    FROM dbo.Users u
    CROSS APPLY OPENJSON(u.CvDataJson, '$.experience') e
    CROSS APPLY OPENJSON(e.[value]) WITH
    (
        Company nvarchar(200) '$.company',
        Role nvarchar(200) '$.role',
        StartDate nvarchar(50) '$.startDate',
        EndDate nvarchar(50) '$.endDate',
        Location nvarchar(150) '$.location',
        Description nvarchar(2000) '$.description',
        Hidden bit '$.hidden'
    ) j
    WHERE u.CvDataJson IS NOT NULL
      AND ISJSON(u.CvDataJson) = 1;

    INSERT INTO dbo.UserCvEducations
        (Id, UserId, Institution, Degree, StartDate, EndDate, Location, Description, IsHidden, SortOrder, Disabled, CreationDate, ModificationDate, CreationUser, ModificationUser)
    SELECT
        NEWID(),
        u.Id,
        LEFT(COALESCE(NULLIF(j.Institution, N''), N'Instituto Tecnologico Beltran'), 200),
        LEFT(COALESCE(NULLIF(j.Degree, N''), N'Trayectoria academica'), 200),
        NULLIF(LEFT(COALESCE(j.StartDate, N''), 50), N''),
        NULLIF(LEFT(COALESCE(j.EndDate, N''), 50), N''),
        NULLIF(LEFT(COALESCE(j.Location, N''), 150), N''),
        NULLIF(LEFT(COALESCE(j.Description, N''), 2000), N''),
        COALESCE(j.Hidden, CONVERT(bit, 0)),
        COALESCE(TRY_CONVERT(int, e.[key]), 0),
        CONVERT(bit, 0),
        SYSUTCDATETIME(),
        SYSUTCDATETIME(),
        N'Migration',
        N'Migration'
    FROM dbo.Users u
    CROSS APPLY OPENJSON(u.CvDataJson, '$.education') e
    CROSS APPLY OPENJSON(e.[value]) WITH
    (
        Institution nvarchar(200) '$.institution',
        Degree nvarchar(200) '$.degree',
        StartDate nvarchar(50) '$.startDate',
        EndDate nvarchar(50) '$.endDate',
        Location nvarchar(150) '$.location',
        Description nvarchar(2000) '$.description',
        Hidden bit '$.hidden'
    ) j
    WHERE u.CvDataJson IS NOT NULL
      AND ISJSON(u.CvDataJson) = 1;

    INSERT INTO dbo.UserCvProjects
        (Id, UserId, Name, Role, StartDate, EndDate, Url, Description, IsHidden, SortOrder, Disabled, CreationDate, ModificationDate, CreationUser, ModificationUser)
    SELECT
        NEWID(),
        u.Id,
        LEFT(COALESCE(NULLIF(j.Name, N''), N'Proyecto academico'), 200),
        LEFT(COALESCE(NULLIF(j.Role, N''), N'Participante'), 200),
        NULLIF(LEFT(COALESCE(j.StartDate, N''), 50), N''),
        NULLIF(LEFT(COALESCE(j.EndDate, N''), 50), N''),
        NULLIF(LEFT(COALESCE(j.Url, N''), 300), N''),
        NULLIF(LEFT(COALESCE(j.Description, N''), 2000), N''),
        COALESCE(j.Hidden, CONVERT(bit, 0)),
        COALESCE(TRY_CONVERT(int, e.[key]), 0),
        CONVERT(bit, 0),
        SYSUTCDATETIME(),
        SYSUTCDATETIME(),
        N'Migration',
        N'Migration'
    FROM dbo.Users u
    CROSS APPLY OPENJSON(u.CvDataJson, '$.projects') e
    CROSS APPLY OPENJSON(e.[value]) WITH
    (
        Name nvarchar(200) '$.name',
        Role nvarchar(200) '$.role',
        StartDate nvarchar(50) '$.startDate',
        EndDate nvarchar(50) '$.endDate',
        Url nvarchar(300) '$.url',
        Description nvarchar(2000) '$.description',
        Hidden bit '$.hidden'
    ) j
    WHERE u.CvDataJson IS NOT NULL
      AND ISJSON(u.CvDataJson) = 1;

    INSERT INTO dbo.UserCvSkills
        (Id, UserId, Name, Level, IsHidden, SortOrder, Disabled, CreationDate, ModificationDate, CreationUser, ModificationUser)
    SELECT
        NEWID(),
        u.Id,
        LEFT(COALESCE(NULLIF(j.Name, N''), N'Habilidad academica'), 120),
        NULLIF(LEFT(COALESCE(j.Level, N''), 80), N''),
        COALESCE(j.Hidden, CONVERT(bit, 0)),
        COALESCE(TRY_CONVERT(int, e.[key]), 0),
        CONVERT(bit, 0),
        SYSUTCDATETIME(),
        SYSUTCDATETIME(),
        N'Migration',
        N'Migration'
    FROM dbo.Users u
    CROSS APPLY OPENJSON(u.CvDataJson, '$.skills') e
    CROSS APPLY OPENJSON(e.[value]) WITH
    (
        Name nvarchar(120) '$.name',
        Level nvarchar(80) '$.level',
        Hidden bit '$.hidden'
    ) j
    WHERE u.CvDataJson IS NOT NULL
      AND ISJSON(u.CvDataJson) = 1;

    INSERT INTO dbo.UserCvLanguages
        (Id, UserId, Name, Level, IsHidden, SortOrder, Disabled, CreationDate, ModificationDate, CreationUser, ModificationUser)
    SELECT
        NEWID(),
        u.Id,
        LEFT(COALESCE(NULLIF(j.Name, N''), N'Idioma'), 120),
        NULLIF(LEFT(COALESCE(j.Level, N''), 80), N''),
        COALESCE(j.Hidden, CONVERT(bit, 0)),
        COALESCE(TRY_CONVERT(int, e.[key]), 0),
        CONVERT(bit, 0),
        SYSUTCDATETIME(),
        SYSUTCDATETIME(),
        N'Migration',
        N'Migration'
    FROM dbo.Users u
    CROSS APPLY OPENJSON(u.CvDataJson, '$.languages') e
    CROSS APPLY OPENJSON(e.[value]) WITH
    (
        Name nvarchar(120) '$.name',
        Level nvarchar(80) '$.level',
        Hidden bit '$.hidden'
    ) j
    WHERE u.CvDataJson IS NOT NULL
      AND ISJSON(u.CvDataJson) = 1;
END
");

            migrationBuilder.DropColumn(
                name: "CvDataJson",
                schema: "dbo",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserCvEducations",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "UserCvExperiences",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "UserCvLanguages",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "UserCvProjects",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "UserCvSkills",
                schema: "dbo");

            migrationBuilder.AddColumn<string>(
                name: "CvDataJson",
                schema: "dbo",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
