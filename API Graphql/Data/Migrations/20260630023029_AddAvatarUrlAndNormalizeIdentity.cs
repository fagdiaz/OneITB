using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarUrlAndNormalizeIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                schema: "dbo",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.Sql(@"
CREATE OR ALTER FUNCTION dbo.OneItb_TitleCase(@input nvarchar(4000))
RETURNS nvarchar(4000)
AS
BEGIN
    DECLARE @trimmed nvarchar(4000) = LTRIM(RTRIM(COALESCE(@input, N'')));
    DECLARE @lower nvarchar(4000) = LOWER(@trimmed);
    DECLARE @result nvarchar(4000) = N'';
    DECLARE @index int = 1;
    DECLARE @length int = LEN(@lower);
    DECLARE @capitalize bit = 1;
    DECLARE @char nchar(1);

    WHILE @index <= @length
    BEGIN
        SET @char = SUBSTRING(@lower, @index, 1);
        SET @result = @result + CASE WHEN @capitalize = 1 THEN UPPER(@char) ELSE @char END;
        SET @capitalize = CASE WHEN @char IN (N' ', N'-', N'''') THEN 1 ELSE 0 END;
        SET @index = @index + 1;
    END

    RETURN @result;
END
");

            migrationBuilder.Sql(@"
UPDATE dbo.Users
SET
    FirstName = dbo.OneItb_TitleCase(FirstName),
    LastName = dbo.OneItb_TitleCase(LastName)
WHERE FirstName IS NOT NULL
   OR LastName IS NOT NULL;

UPDATE dbo.Accounts
SET Email =
    CASE
        WHEN LEN(LTRIM(RTRIM(Email))) = 0 THEN Email
        ELSE UPPER(LEFT(LOWER(LTRIM(RTRIM(Email))), 1)) + SUBSTRING(LOWER(LTRIM(RTRIM(Email))), 2, LEN(LTRIM(RTRIM(Email))))
    END
WHERE Email IS NOT NULL;
");

            migrationBuilder.Sql("DROP FUNCTION dbo.OneItb_TitleCase;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                schema: "dbo",
                table: "Users");
        }
    }
}
