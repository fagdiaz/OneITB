using HotChocolate;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using OneITB.Core.Services.Interfaces;
using Services.Accounts;
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
        var service = new AccountsService(unitOfWork, CreateJwtConfiguration());

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
        var service = new AccountsService(unitOfWork, CreateJwtConfiguration());

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
        var service = new AccountsService(unitOfWork, CreateJwtConfiguration());

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(() =>
            service.Login(new LoginInput("inactive@itbeltran.test", "Test1234!")));

        Assert.Contains("incorrectos", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Login_LocksAccountAfterFiveWrongPasswords()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = new AccountsService(unitOfWork, CreateJwtConfiguration());

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
        var service = new AccountsService(unitOfWork, CreateJwtConfiguration());

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
        var service = new AccountsService(unitOfWork, CreateJwtConfiguration());

        AuthPayload payload = await service.Login(new LoginInput("student@itbeltran.test", "Test1234!"));

        Assert.True(payload.IsAuthenticated);
        var persisted = await context.Accounts.AsNoTracking()
            .SingleAsync(item => item.Id == ServiceTestData.StudentUserId);
        Assert.Equal(0, persisted.FailedLoginAttempts);
        Assert.Null(persisted.LockoutEnd);
    }

    private static IConfiguration CreateJwtConfiguration()
    {
        var configuration = new Mock<IConfiguration>(MockBehavior.Strict);
        configuration.Setup(item => item["Jwt:Key"]).Returns("oneitb23-test-signing-key-32chars");
        configuration.Setup(item => item["Jwt:Issuer"]).Returns("OneITB23.Tests");
        return configuration.Object;
    }
}
