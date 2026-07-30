using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using Services.Auth;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Auth;

public sealed class MicrosoftEntraAuthServiceTests
{
    private static readonly MicrosoftEntraIdentity Identity = new(
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "object-123",
        "ana.perez@itbeltran.com.ar",
        "Ana",
        "Perez");

    [Fact]
    public async Task LoginAsync_NewIdentity_CreatesNonPrivilegedExternalOnlyAccount()
    {
        await using OneItbContext context = ServiceTestData.CreateContext();
        MicrosoftEntraAuthService service = CreateService(context);

        AuthPayload payload = await service.LoginAsync(
            "validated-upstream-token",
            "127.0.0.1",
            "correlation-1");

        User user = await context.Users
            .Include(item => item.Account)
            .SingleAsync();
        Assert.Equal("Estudiante", user.Role);
        Assert.Null(user.Account.PasswordHash);
        Assert.True(user.Account.HasExternalIdentity);
        Assert.Equal(MicrosoftEntraOptions.ProviderName, user.Account.ExternalProvider);
        Assert.Equal(Identity.Email, user.Account.Email);
        Assert.Equal("local-oneitb-jwt", payload.Token);
        Assert.Equal(Identity.Email, payload.Email);
        Assert.Contains(
            await context.AuditLogs.ToListAsync(),
            item => item.Action == "ExternalLogin" &&
                item.NewValuesJson!.Contains("Accepted", StringComparison.Ordinal));
    }

    [Fact]
    public async Task LoginAsync_ExistingEmail_LinksWithoutDuplicatingUser()
    {
        await using OneItbContext context = ServiceTestData.CreateContext();
        User user = ServiceTestData.CreateUser(
            Guid.NewGuid(),
            "Ana",
            "Perez",
            "Egresado",
            true);
        context.Accounts.Add(ServiceTestData.CreateAccount(user, Identity.Email));
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        MicrosoftEntraAuthService service = CreateService(context);

        AuthPayload payload = await service.LoginAsync(
            "validated-upstream-token",
            "127.0.0.1",
            "correlation-2");

        Assert.Equal(user.Id, payload.Id);
        Assert.Equal(1, await context.Users.CountAsync());
        Account account = await context.Accounts.SingleAsync();
        Assert.True(account.HasExternalIdentity);
        Assert.NotNull(account.PasswordHash);
    }

    [Fact]
    public async Task LoginAsync_RepeatedExternalIdentity_IsIdempotent()
    {
        await using OneItbContext context = ServiceTestData.CreateContext();
        MicrosoftEntraAuthService service = CreateService(context);

        AuthPayload first = await service.LoginAsync(
            "validated-upstream-token",
            "127.0.0.1",
            "first-login");
        context.ChangeTracker.Clear();

        AuthPayload second = await service.LoginAsync(
            "validated-upstream-token",
            "127.0.0.1",
            "second-login");

        Assert.Equal(first.Id, second.Id);
        Assert.Equal(1, await context.Users.CountAsync());
        Assert.Equal(1, await context.Accounts.CountAsync());
        Assert.Equal(2, await context.AuditLogs.CountAsync(
            item => item.Action == "ExternalLogin"));
    }

    [Theory]
    [InlineData("Administrador")]
    [InlineData("Moderador")]
    [InlineData("Profesor")]
    [InlineData("Empleador")]
    public async Task LoginAsync_UnlinkedPrivilegedAccount_RequiresManagedLink(
        string role)
    {
        await using OneItbContext context = ServiceTestData.CreateContext();
        User user = ServiceTestData.CreateUser(
            Guid.NewGuid(),
            "Ana",
            "Perez",
            role,
            true);
        context.Accounts.Add(ServiceTestData.CreateAccount(user, Identity.Email));
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        MicrosoftEntraAuthService service = CreateService(context);

        MicrosoftEntraAuthenticationException exception =
            await Assert.ThrowsAsync<MicrosoftEntraAuthenticationException>(() =>
                service.LoginAsync(
                    "validated-upstream-token",
                    "127.0.0.1",
                    "privileged-link"));

        Assert.Equal("ENTRA_ACCOUNT_CONFLICT", exception.Code);
        Assert.False((await context.Accounts.SingleAsync()).HasExternalIdentity);
    }

    [Fact]
    public async Task LoginAsync_ExistingDifferentExternalIdentity_FailsClosed()
    {
        await using OneItbContext context = ServiceTestData.CreateContext();
        User user = ServiceTestData.CreateUser(
            Guid.NewGuid(),
            "Ana",
            "Perez",
            "Estudiante",
            true);
        Account account = ServiceTestData.CreateAccount(user, Identity.Email);
        account.ExternalProvider = MicrosoftEntraOptions.ProviderName;
        account.ExternalTenantId = Identity.TenantId;
        account.ExternalSubjectId = "different-object";
        context.Accounts.Add(account);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        MicrosoftEntraAuthService service = CreateService(context);

        MicrosoftEntraAuthenticationException exception =
            await Assert.ThrowsAsync<MicrosoftEntraAuthenticationException>(() =>
                service.LoginAsync(
                    "validated-upstream-token",
                    "127.0.0.1",
                    "correlation-3"));

        Assert.Equal("ENTRA_ACCOUNT_CONFLICT", exception.Code);
        Assert.Equal("different-object", (await context.Accounts.SingleAsync()).ExternalSubjectId);
        Assert.Contains(
            await context.AuditLogs.ToListAsync(),
            item => item.NewValuesJson!.Contains("Rejected", StringComparison.Ordinal));
    }

    [Fact]
    public async Task LoginAsync_InvalidToken_PersistsSanitizedRejectionOnly()
    {
        await using OneItbContext context = ServiceTestData.CreateContext();
        var validator = new Mock<IMicrosoftEntraTokenValidator>(MockBehavior.Strict);
        validator
            .Setup(item => item.ValidateAsync(
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new MicrosoftEntraAuthenticationException(
                "ENTRA_INVALID_TOKEN",
                "No se pudo validar la identidad institucional."));
        MicrosoftEntraAuthService service = CreateService(context, validator.Object);

        await Assert.ThrowsAsync<MicrosoftEntraAuthenticationException>(() =>
            service.LoginAsync("secret-token-value", "127.0.0.1", "correlation-4"));

        Assert.Empty(context.Users);
        AuditLog audit = await context.AuditLogs.SingleAsync();
        Assert.DoesNotContain("secret-token-value", audit.NewValuesJson);
        Assert.Contains("ENTRA_INVALID_TOKEN", audit.NewValuesJson);
    }

    private static MicrosoftEntraAuthService CreateService(
        OneItbContext context,
        IMicrosoftEntraTokenValidator? validator = null)
    {
        validator ??= CreateValidator();
        var jwt = new Mock<IJwtTokenService>(MockBehavior.Strict);
        jwt.Setup(item => item.IssueAccessToken(It.IsAny<User>()))
            .Returns("local-oneitb-jwt");

        return new MicrosoftEntraAuthService(
            context,
            validator,
            new AllowAllRateLimiter(),
            jwt.Object,
            TimeProvider.System,
            NullLogger<MicrosoftEntraAuthService>.Instance);
    }

    private static IMicrosoftEntraTokenValidator CreateValidator()
    {
        var validator = new Mock<IMicrosoftEntraTokenValidator>(MockBehavior.Strict);
        validator
            .Setup(item => item.ValidateAsync(
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Identity);
        return validator.Object;
    }

    private sealed class AllowAllRateLimiter : IMicrosoftEntraRateLimiter
    {
        public Task<MicrosoftEntraRateLimitDecision> TryAcquireClientAsync(
            string clientSource,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(MicrosoftEntraRateLimitDecision.Allowed());

        public Task<MicrosoftEntraRateLimitDecision> TryAcquireIdentityAsync(
            string tenantId,
            string subjectId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(MicrosoftEntraRateLimitDecision.Allowed());
    }
}
