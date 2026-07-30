using Microsoft.EntityFrameworkCore;
using OneITB.Core.Services.Interfaces;
using Services.Auth;
using Services.Repositories;
using Services.Tests.TestSupport;
using Services.Users;
using Xunit;

namespace Services.Tests.Auth;

public sealed class UsersServiceTests
{
    [Fact]
    public async Task RegisterAsync_PersistsNormalizedUserAccountBcryptHashAndCareerLinks()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        UserPayload payload = await service.RegisterAsync(new RegisterInput(
            "  LU.PRUEBA@ITBELTRAN.COM.AR  ",
            "Test1234!",
            "luCIA",
            "pEReZ",
            "estudiante",
            new[] { ServiceTestData.CareerId },
            null));

        Assert.True(payload.Success);
        var persisted = await context.Users
            .Include(user => user.Account)
            .Include(user => user.UserCareers)
            .SingleAsync(user => user.Id == payload.Id);

        Assert.Equal("Lucia", persisted.FirstName);
        Assert.Equal("Perez", persisted.LastName);
        Assert.Equal("Estudiante", persisted.Role);
        Assert.Equal("lu.prueba@itbeltran.com.ar", persisted.Account.Email);
        string passwordHash = Assert.IsType<string>(persisted.Account.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("Test1234!", passwordHash));
        Assert.Equal(60, passwordHash.Length);
        Assert.Contains(persisted.UserCareers, link => link.CareerId == ServiceTestData.CareerId);
    }

    [Fact]
    public async Task RegisterAsync_RejectsAdministrativeRoleFromPublicRegistration()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.RegisterAsync(new RegisterInput(
                "admin.intent@itbeltran.com.ar",
                "Test1234!",
                "admin",
                "intent",
                "Administrador",
                new[] { ServiceTestData.CareerId },
                null)));
    }

    [Fact]
    public async Task RegisterAsync_RejectsMissingCareerSelection()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.RegisterAsync(new RegisterInput(
                "missing.career@itbeltran.com.ar",
                "Test1234!",
                "maria",
                "carrera",
                "Estudiante",
                Array.Empty<int>(),
                null)));
    }

    [Fact]
    public async Task RegisterAsync_PreCancelledToken_DoesNotPersistUser()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);
        using var cancellationSource = new CancellationTokenSource();
        cancellationSource.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            service.RegisterAsync(
                new RegisterInput(
                    "cancelled@itbeltran.com.ar",
                    "Test1234!",
                    "Operacion",
                    "Cancelada",
                    "Estudiante",
                    new[] { ServiceTestData.CareerId },
                    null),
                cancellationSource.Token));

        Assert.False(await context.Accounts.AnyAsync(
            account => account.Email == "cancelled@itbeltran.com.ar"));
    }

    [Fact]
    public async Task UpdateUserRoleAsync_RejectsChangesToAdministratorAccounts()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpdateUserRoleAsync(
                ServiceTestData.AdminUserId,
                ServiceTestData.AdminUserId,
                "Estudiante",
                "Test1234!"));

        Assert.Contains("Administrador", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdateUserStatusAsync_RejectsDeactivatingAdministratorAccounts()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpdateUserStatusAsync(ServiceTestData.AdminUserId, false));

        Assert.Contains("Administrador", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.True(context.Users.Single(user => user.Id == ServiceTestData.AdminUserId).IsActive);
    }

    private static UsersService CreateService(
        IUnitOfWork unitOfWork,
        OneItb.Data.OneItbContext context)
    {
        return new UsersService(
            unitOfWork,
            context,
            new BcryptPasswordHasher(new PasswordHashingOptions(10)));
    }
}
