using Microsoft.EntityFrameworkCore;
using OneITB.Core.Services.Interfaces;
using Services.Auth;
using Services.Academic;
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
    public async Task RegisterAsync_RejectsMultipleCareersForPublicStudent()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        ArgumentException exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            service.RegisterAsync(new RegisterInput(
                "multi.career@itbeltran.com.ar",
                "Test1234!",
                "Maria",
                "Prueba",
                "Estudiante",
                new[] { ServiceTestData.CareerId, ServiceTestData.OtherCareerId },
                null)));

        Assert.Contains("exactamente una carrera", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.False(await context.Accounts.AnyAsync(account =>
            account.Email == "multi.career@itbeltran.com.ar"));
    }

    [Fact]
    public async Task UpdateProfileAsync_RejectsMultipleCareersForStudentWithoutChangingLinks()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        Services.Academic.StudentEnrollmentException exception =
            await Assert.ThrowsAsync<Services.Academic.StudentEnrollmentException>(() =>
                service.UpdateProfileAsync(new UpdateProfileInput(
                    Id: ServiceTestData.StudentUserId,
                    Biography: null,
                    LinkedIn: null,
                    Facebook: null,
                    Instagram: null,
                    Phone: null,
                    AvatarUrl: null,
                    CareerIds: new[] { ServiceTestData.CareerId, ServiceTestData.OtherCareerId },
                    CvExperiences: null,
                    CvEducations: null,
                    CvProjects: null,
                    CvSkills: null,
                    CvLanguages: null)));

        Assert.Equal("ACADEMIC_STUDENT_SINGLE_CAREER_REQUIRED", exception.Code);
        Assert.Equal(
            new[] { ServiceTestData.CareerId },
            await context.UserCareers
                .Where(link => link.UserId == ServiceTestData.StudentUserId)
                .Select(link => link.CareerId)
                .ToArrayAsync());
    }

    [Fact]
    public async Task UpdateProfileAsync_ReplacesStudentCareerThroughSharedAssignmentService()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        UpdateProfilePayload payload = await service.UpdateProfileAsync(new UpdateProfileInput(
            Id: ServiceTestData.StudentUserId,
            Biography: null,
            LinkedIn: null,
            Facebook: null,
            Instagram: null,
            Phone: null,
            AvatarUrl: null,
            CareerIds: new[] { ServiceTestData.OtherCareerId },
            CvExperiences: null,
            CvEducations: null,
            CvProjects: null,
            CvSkills: null,
            CvLanguages: null));

        Assert.True(payload.Success);
        Assert.Equal(
            new[] { ServiceTestData.OtherCareerId },
            await context.UserCareers
                .Where(link => link.UserId == ServiceTestData.StudentUserId)
                .Select(link => link.CareerId)
                .ToArrayAsync());
    }

    [Fact]
    public async Task RegisterAsync_RejectsAdministrativeRoleFromPublicRegistration()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        PublicRegistrationException exception = await Assert.ThrowsAsync<PublicRegistrationException>(() =>
            service.RegisterAsync(new RegisterInput(
                "admin.intent@itbeltran.com.ar",
                "Test1234!",
                "admin",
                "intent",
                "Administrador",
                new[] { ServiceTestData.CareerId },
                null)));

        Assert.Equal("REGISTRATION_POLICY_REJECTED", exception.Code);
    }

    [Fact]
    public async Task RegisterAsync_RejectsProfessorRoleFromPublicRegistration()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        PublicRegistrationException exception = await Assert.ThrowsAsync<PublicRegistrationException>(() =>
            service.RegisterAsync(new RegisterInput(
                "profesor.publico@itbeltran.com.ar",
                "Test1234!",
                "Paula",
                "Profesora",
                "Profesor",
                new[] { ServiceTestData.CareerId },
                null)));

        Assert.Equal("REGISTRATION_POLICY_REJECTED", exception.Code);
        Assert.False(await context.Accounts.AnyAsync(
            account => account.Email == "profesor.publico@itbeltran.com.ar"));
    }

    [Fact]
    public async Task RegisterAsync_RejectsExternalDomainBeforePersisting()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        PublicRegistrationException exception = await Assert.ThrowsAsync<PublicRegistrationException>(() =>
            service.RegisterAsync(new RegisterInput(
                "student@example.com",
                "Test1234!",
                "Eva",
                "Externa",
                "Estudiante",
                new[] { ServiceTestData.CareerId },
                null)));

        Assert.Equal("REGISTRATION_POLICY_REJECTED", exception.Code);
        Assert.False(await context.Accounts.AnyAsync(
            account => account.Email == "student@example.com"));
    }

    [Fact]
    public async Task RegisterAsync_DuplicateIdentityUsesGenericNonEnumeratingContract()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        context.Accounts.Single(account => account.Id == ServiceTestData.StudentUserId).Email =
            "student@itbeltran.com.ar";
        await context.SaveChangesAsync();
        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork, context);

        PublicRegistrationException exception = await Assert.ThrowsAsync<PublicRegistrationException>(() =>
            service.RegisterAsync(new RegisterInput(
                "STUDENT@ITBELTRAN.COM.AR",
                "Test1234!",
                "Sofia",
                "Duplicada",
                "Estudiante",
                new[] { ServiceTestData.CareerId },
                null)));

        Assert.Equal("REGISTRATION_NOT_AVAILABLE", exception.Code);
        Assert.DoesNotContain("existe", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("cuenta", exception.Message, StringComparison.OrdinalIgnoreCase);
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
            new BcryptPasswordHasher(new PasswordHashingOptions(10)),
            new PublicRegistrationPolicy("itbeltran.com.ar"),
            new UserCareerAssignmentService(context));
    }
}
