using HotChocolate;
using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using Services.Accounts;
using Services.Auth;
using Services.Repositories;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Auth;

public sealed class AccountsServiceTests
{
    [Fact]
    public async Task Login_ReturnsAuthenticatedPayloadAndJwtForActiveUser()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        AuthPayload payload = await service.Login(new LoginInput("student@itbeltran.test", "Test1234!"));

        Assert.True(payload.IsAuthenticated);
        Assert.Equal(ServiceTestData.StudentUserId, payload.Id);
        Assert.Equal("Sofia", payload.Username);
        Assert.Equal("Estudiante", payload.Role);
        Assert.False(string.IsNullOrWhiteSpace(payload.Token));
        Assert.Equal(3, payload.Token.Split('.').Length);
    }

    [Fact]
    public async Task Login_RejectsWrongPasswordWithoutToken()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(() =>
            service.Login(new LoginInput("student@itbeltran.test", "Wrong1234!")));

        Assert.Contains("incorrectos", exception.Message, StringComparison.OrdinalIgnoreCase);

        var account = await context.Accounts.AsNoTracking()
            .SingleAsync(item => item.Id == ServiceTestData.StudentUserId);
        Assert.Equal(1, account.FailedLoginAttempts);
        Assert.Null(account.LockoutEnd);
    }

    [Fact]
    public async Task Login_RejectsInactiveUser()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(() =>
            service.Login(new LoginInput("inactive@itbeltran.test", "Test1234!")));

        Assert.Contains("incorrectos", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Login_ExternalOnlyAccount_RejectsWithoutPasswordLockout()
    {
        await using var context = ServiceTestData.CreateContext();
        User user = ServiceTestData.CreateUser(
            Guid.NewGuid(),
            "Ana",
            "Perez",
            "Estudiante",
            true);
        var account = new OneItb.Entities.Models.Account
        {
            Id = user.Id,
            Email = "ana.perez@itbeltran.com.ar",
            PasswordHash = null,
            ExternalProvider = MicrosoftEntraOptions.ProviderName,
            ExternalTenantId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            ExternalSubjectId = "object-123",
            CreatedAt = DateTime.UtcNow,
            User = user
        };
        user.Account = account;
        context.Accounts.Add(account);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(() =>
            service.Login(new LoginInput(account.Email, "AnyPassword123!")));

        Assert.Contains("incorrectos", exception.Message, StringComparison.OrdinalIgnoreCase);
        var persisted = await context.Accounts.AsNoTracking().SingleAsync();
        Assert.Equal(0, persisted.FailedLoginAttempts);
        Assert.Null(persisted.LockoutEnd);
    }

    [Fact]
    public async Task Login_LocksAccountAfterFiveWrongPasswords()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        GraphQLException exception = null!;
        for (int attempt = 0; attempt < 5; attempt++)
        {
            exception = await Assert.ThrowsAsync<GraphQLException>(() =>
                service.Login(new LoginInput("student@itbeltran.test", "Wrong1234!")));
        }

        Assert.Contains("bloqueada", exception.Message, StringComparison.OrdinalIgnoreCase);

        var account = await context.Accounts.AsNoTracking()
            .SingleAsync(item => item.Id == ServiceTestData.StudentUserId);
        Assert.Equal(5, account.FailedLoginAttempts);
        Assert.NotNull(account.LockoutEnd);
        Assert.True(account.LockoutEnd > DateTime.UtcNow);
    }

    [Fact]
    public async Task Login_RejectsValidPasswordWhileAccountIsLocked()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var account = await context.Accounts.SingleAsync(item => item.Id == ServiceTestData.StudentUserId);
        account.FailedLoginAttempts = 5;
        account.LockoutEnd = DateTime.UtcNow.AddMinutes(10);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(() =>
            service.Login(new LoginInput("student@itbeltran.test", "Test1234!")));

        Assert.Contains("bloqueada", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Login_ResetsFailedAttemptsAfterSuccessfulAuthentication()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var account = await context.Accounts.SingleAsync(item => item.Id == ServiceTestData.StudentUserId);
        account.FailedLoginAttempts = 2;
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        AuthPayload payload = await service.Login(new LoginInput("student@itbeltran.test", "Test1234!"));

        Assert.True(payload.IsAuthenticated);
        var persisted = await context.Accounts.AsNoTracking()
            .SingleAsync(item => item.Id == ServiceTestData.StudentUserId);
        Assert.Equal(0, persisted.FailedLoginAttempts);
        Assert.Null(persisted.LockoutEnd);
    }

    [Fact]
    public async Task Login_UpgradesLegacyBcryptHashAfterSuccessfulAuthentication()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var passwordHasher = new BcryptPasswordHasher(new PasswordHashingOptions(10));
        var service = new AccountsService(
            unitOfWork,
            CreateJwtTokenService(),
            passwordHasher);

        AuthPayload payload = await service.Login(
            new LoginInput("student@itbeltran.test", "Test1234!"));

        Assert.True(payload.IsAuthenticated);
        string? upgradedHash = await context.Accounts
            .AsNoTracking()
            .Where(item => item.Id == ServiceTestData.StudentUserId)
            .Select(item => item.PasswordHash)
            .SingleAsync();
        Assert.NotNull(upgradedHash);
        Assert.False(passwordHasher.NeedsRehash(upgradedHash));
    }

    private static AccountsService CreateService(IUnitOfWork unitOfWork)
    {
        return new AccountsService(
            unitOfWork,
            CreateJwtTokenService(),
            new BcryptPasswordHasher(new PasswordHashingOptions(10)));
    }

    private static IJwtTokenService CreateJwtTokenService()
    {
        var options = new JwtTokenOptions(
            "oneitb23-test-signing-key-with-at-least-32-bytes",
            "OneITB23.Tests",
            "OneITB23.Tests",
            TimeSpan.FromHours(2));
        return new JwtTokenService(options, TimeProvider.System);
    }
}
