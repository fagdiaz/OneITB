using HotChocolate;
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

    private static IConfiguration CreateJwtConfiguration()
    {
        var configuration = new Mock<IConfiguration>(MockBehavior.Strict);
        configuration.Setup(item => item["Jwt:Key"]).Returns("oneitb23-test-signing-key-32chars");
        configuration.Setup(item => item["Jwt:Issuer"]).Returns("OneITB23.Tests");
        return configuration.Object;
    }
}
