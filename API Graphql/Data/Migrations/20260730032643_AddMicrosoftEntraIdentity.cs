using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMicrosoftEntraIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                schema: "dbo",
                table: "Accounts",
                type: "char(60)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "char(60)");

            migrationBuilder.AddColumn<string>(
                name: "ExternalProvider",
                schema: "dbo",
                table: "Accounts",
                type: "varchar(32)",
                unicode: false,
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalSubjectId",
                schema: "dbo",
                table: "Accounts",
                type: "varchar(128)",
                unicode: false,
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalTenantId",
                schema: "dbo",
                table: "Accounts",
                type: "varchar(64)",
                unicode: false,
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastExternalLoginAt",
                schema: "dbo",
                table: "Accounts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_ExternalProvider_ExternalTenantId_ExternalSubjectId",
                schema: "dbo",
                table: "Accounts",
                columns: new[] { "ExternalProvider", "ExternalTenantId", "ExternalSubjectId" },
                unique: true,
                filter: "[ExternalProvider] IS NOT NULL AND [ExternalTenantId] IS NOT NULL AND [ExternalSubjectId] IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AuthenticationCredential",
                schema: "dbo",
                table: "Accounts",
                sql: "[PasswordHash] IS NOT NULL OR ([ExternalProvider] IS NOT NULL AND [ExternalTenantId] IS NOT NULL AND [ExternalSubjectId] IS NOT NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_ExternalIdentityCompleteness",
                schema: "dbo",
                table: "Accounts",
                sql: "([ExternalProvider] IS NULL AND [ExternalTenantId] IS NULL AND [ExternalSubjectId] IS NULL) OR ([ExternalProvider] IS NOT NULL AND [ExternalTenantId] IS NOT NULL AND [ExternalSubjectId] IS NOT NULL)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF EXISTS (SELECT 1 FROM [dbo].[Accounts] WHERE [PasswordHash] IS NULL)
                    THROW 51000, 'Cannot remove Microsoft Entra identity while external-only accounts exist.', 1;
                """);

            migrationBuilder.DropIndex(
                name: "IX_Accounts_ExternalProvider_ExternalTenantId_ExternalSubjectId",
                schema: "dbo",
                table: "Accounts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AuthenticationCredential",
                schema: "dbo",
                table: "Accounts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_ExternalIdentityCompleteness",
                schema: "dbo",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "ExternalProvider",
                schema: "dbo",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "ExternalSubjectId",
                schema: "dbo",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "ExternalTenantId",
                schema: "dbo",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "LastExternalLoginAt",
                schema: "dbo",
                table: "Accounts");

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                schema: "dbo",
                table: "Accounts",
                type: "char(60)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "char(60)",
                oldNullable: true);
        }
    }
}
