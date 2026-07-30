using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployerOnboardingWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MagicLinks_Accounts_AccountId",
                schema: "dbo",
                table: "MagicLinks");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AuthenticationCredential",
                schema: "dbo",
                table: "Accounts");

            migrationBuilder.AddColumn<bool>(
                name: "MagicLinkEnabled",
                schema: "dbo",
                table: "Accounts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(
                """
                UPDATE account
                SET account.MagicLinkEnabled = 1
                FROM dbo.Accounts AS account
                INNER JOIN dbo.Users AS [user] ON [user].Id = account.Id
                WHERE [user].[Role] = 'Empleador';
                """);

            migrationBuilder.CreateTable(
                name: "EmployerRequests",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    ContactName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Email = table.Column<string>(type: "varchar(256)", unicode: false, maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "varchar(32)", unicode: false, maxLength: 32, nullable: false),
                    TaxId = table.Column<string>(type: "char(11)", unicode: false, nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProcessedByAdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProvisionedUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PrivacyConsentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EmailDeliveryStatus = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    LastEmailAttemptAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailDeliveryAttempts = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployerRequests", x => x.Id);
                    table.CheckConstraint("CK_EmployerRequests_EmailDeliveryAttempts", "[EmailDeliveryAttempts] >= 0");
                    table.CheckConstraint("CK_EmployerRequests_EmailDeliveryStatus", "[EmailDeliveryStatus] IN ('NotRequested','Pending','Delivered','Failed')");
                    table.CheckConstraint("CK_EmployerRequests_Status", "[Status] IN ('Pending','Approved','Rejected')");
                    table.ForeignKey(
                        name: "FK_EmployerRequests_Users_ProcessedByAdminId",
                        column: x => x.ProcessedByAdminId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployerRequests_Users_ProvisionedUserId",
                        column: x => x.ProvisionedUserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployerOnboardingOutboxMessages",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployerRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NextAttemptAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LeaseExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Attempts = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastErrorCode = table.Column<string>(type: "varchar(80)", unicode: false, maxLength: 80, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployerOnboardingOutboxMessages", x => x.Id);
                    table.CheckConstraint("CK_EmployerOnboardingOutbox_Attempts", "[Attempts] >= 0");
                    table.CheckConstraint("CK_EmployerOnboardingOutbox_Status", "[Status] IN ('Pending','Processing','Delivered','Failed')");
                    table.ForeignKey(
                        name: "FK_EmployerOnboardingOutboxMessages_EmployerRequests_EmployerRequestId",
                        column: x => x.EmployerRequestId,
                        principalSchema: "dbo",
                        principalTable: "EmployerRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AuthenticationCredential",
                schema: "dbo",
                table: "Accounts",
                sql: "[PasswordHash] IS NOT NULL OR ([ExternalProvider] IS NOT NULL AND [ExternalTenantId] IS NOT NULL AND [ExternalSubjectId] IS NOT NULL) OR [MagicLinkEnabled] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_EmployerOnboardingOutboxMessages_EmployerRequestId",
                schema: "dbo",
                table: "EmployerOnboardingOutboxMessages",
                column: "EmployerRequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployerOnboardingOutboxMessages_Status_NextAttemptAt",
                schema: "dbo",
                table: "EmployerOnboardingOutboxMessages",
                columns: new[] { "Status", "NextAttemptAt" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployerRequests_Email",
                schema: "dbo",
                table: "EmployerRequests",
                column: "Email",
                unique: true,
                filter: "[Status] IN ('Pending','Approved')");

            migrationBuilder.CreateIndex(
                name: "IX_EmployerRequests_ProcessedByAdminId",
                schema: "dbo",
                table: "EmployerRequests",
                column: "ProcessedByAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployerRequests_ProvisionedUserId",
                schema: "dbo",
                table: "EmployerRequests",
                column: "ProvisionedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployerRequests_Status_CreatedAt",
                schema: "dbo",
                table: "EmployerRequests",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployerRequests_TaxId",
                schema: "dbo",
                table: "EmployerRequests",
                column: "TaxId",
                unique: true,
                filter: "[Status] IN ('Pending','Approved')");

            migrationBuilder.AddForeignKey(
                name: "FK_MagicLinks_Accounts_AccountId",
                schema: "dbo",
                table: "MagicLinks",
                column: "AccountId",
                principalSchema: "dbo",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF EXISTS (
                    SELECT 1
                    FROM dbo.Accounts
                    WHERE PasswordHash IS NULL
                      AND NOT (
                          ExternalProvider IS NOT NULL
                          AND ExternalTenantId IS NOT NULL
                          AND ExternalSubjectId IS NOT NULL
                      )
                )
                BEGIN
                    THROW 51000, 'Rollback blocked: Magic-Link-only accounts require another credential before removing MagicLinkEnabled.', 1;
                END;
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_MagicLinks_Accounts_AccountId",
                schema: "dbo",
                table: "MagicLinks");

            migrationBuilder.DropTable(
                name: "EmployerOnboardingOutboxMessages",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "EmployerRequests",
                schema: "dbo");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AuthenticationCredential",
                schema: "dbo",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "MagicLinkEnabled",
                schema: "dbo",
                table: "Accounts");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AuthenticationCredential",
                schema: "dbo",
                table: "Accounts",
                sql: "[PasswordHash] IS NOT NULL OR ([ExternalProvider] IS NOT NULL AND [ExternalTenantId] IS NOT NULL AND [ExternalSubjectId] IS NOT NULL)");

            migrationBuilder.AddForeignKey(
                name: "FK_MagicLinks_Accounts_AccountId",
                schema: "dbo",
                table: "MagicLinks",
                column: "AccountId",
                principalSchema: "dbo",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
