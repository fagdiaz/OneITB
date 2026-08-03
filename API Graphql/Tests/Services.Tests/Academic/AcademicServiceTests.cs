using Moq;
using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;
using Services.Academic;
using Services.Notifications;
using Services.Siu;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Academic;

public sealed class AcademicServiceTests
{
    [Fact]
    public async Task GetAcademicResourcesAsync_FiltersByCategoryAndSearchWithinCareer()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        await SeedResourcesAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        IReadOnlyList<AcademicResource> resources = await service.GetAcademicResourcesAsync(
            ServiceTestData.StudentUserId,
            "Estudiante",
            ServiceTestData.SubjectId,
            "parcial",
            AcademicResourceCategory.Examen);

        AcademicResource resource = Assert.Single(resources);
        Assert.Equal("Parcial resuelto", resource.Title);
        Assert.Equal(AcademicResourceCategory.Examen, resource.Category);
        Assert.Equal(2, resource.Version);
        Assert.NotNull(resource.Subject?.Career);
        Assert.NotNull(resource.Uploader);
    }

    [Fact]
    public async Task GetAcademicResourcesAsync_RejectsStudentOutsideSubjectCareer()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        await SeedResourcesAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.GetAcademicResourcesAsync(
                ServiceTestData.OtherStudentUserId,
                "Estudiante",
                ServiceTestData.SubjectId,
                null,
                null));

        Assert.Contains("acceso", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task AddAcademicResourceAsync_LinkedProfessorPersistsCategoryVersionAndNotifies()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        AcademicResource resource = await service.AddAcademicResourceAsync(
            ServiceTestData.TeacherUserId,
            "Profesor",
            ServiceTestData.SubjectId,
            "Guia de laboratorio",
            "Practica de arrays",
            AcademicResourceCategory.Apunte,
            3,
            "/uploads/guia.pdf",
            null);

        Assert.Equal(ServiceTestData.TeacherUserId, resource.UploaderId);
        Assert.Equal(AcademicResourceCategory.Apunte, resource.Category);
        Assert.Equal(3, resource.Version);
        Assert.Equal("File", resource.ResourceType);
        Assert.True(resource.IsActive);
        notifications.Verify(
            service => service.CreateNotificationsAsync(
                It.IsAny<IReadOnlyCollection<Guid>>(),
                NotificationType.AcademicResource,
                It.Is<string>(message => message.Contains("Guia de laboratorio", StringComparison.Ordinal)),
                "/academic?subjectId=101",
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task AddAcademicResourceAsync_RejectsEnrolledStudent()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddAcademicResourceAsync(
                ServiceTestData.StudentUserId,
                "Estudiante",
                ServiceTestData.SubjectId,
                "Intento sin permisos",
                null,
                AcademicResourceCategory.Apunte,
                1,
                "/uploads/intento.pdf",
                null));

        Assert.Contains("permisos", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.AcademicResources);
        notifications.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task DeleteResourceAsync_SoftDeletesResourceForUploader()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        AcademicResource resource = await service.AddAcademicResourceAsync(
            ServiceTestData.TeacherUserId,
            "Profesor",
            ServiceTestData.SubjectId,
            "Apunte a remover",
            null,
            AcademicResourceCategory.Otro,
            1,
            null,
            "https://itbeltran.test/apunte");

        AcademicResource deleted = await service.DeleteResourceAsync(
            ServiceTestData.TeacherUserId,
            "Profesor",
            resource.Id);
        IReadOnlyList<AcademicResource> visible = await service.GetAcademicResourcesAsync(
            ServiceTestData.TeacherUserId,
            "Profesor",
            ServiceTestData.SubjectId,
            null,
            null);

        Assert.False(deleted.IsActive);
        Assert.Empty(visible);
    }

    [Fact]
    public async Task DeleteResourceAsync_RejectsLegacyStudentUploader()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var legacyResource = new AcademicResource
        {
            Id = Guid.NewGuid(),
            SubjectId = ServiceTestData.SubjectId,
            UploaderId = ServiceTestData.StudentUserId,
            Title = "Recurso legado",
            ExternalUrl = "https://itbeltran.test/recurso-legado",
            ResourceType = "Link",
            Category = AcademicResourceCategory.Otro,
            Version = 1,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
        context.AcademicResources.Add(legacyResource);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.DeleteResourceAsync(
                ServiceTestData.StudentUserId,
                "Estudiante",
                legacyResource.Id));

        Assert.Contains("permisos", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.True(await context.AcademicResources
            .IgnoreQueryFilters()
            .Where(item => item.Id == legacyResource.Id)
            .Select(item => item.IsActive)
            .SingleAsync());
    }

    [Fact]
    public async Task UpsertAcademicProgressAsync_RejectsStudentRoleBeforeSaving()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpsertAcademicProgressAsync(
                ServiceTestData.StudentUserId,
                "Estudiante",
                ServiceTestData.StudentUserId,
                ServiceTestData.SubjectId,
                8,
                AcademicProgressStatus.Approved,
                null));

        Assert.Contains("permisos", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.AcademicProgressRecords);
        notifications.Verify(
            service => service.CreateNotificationsAsync(
                It.IsAny<IReadOnlyCollection<Guid>>(),
                It.IsAny<NotificationType>(),
                It.IsAny<string>(),
                It.IsAny<string?>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task GetAcademicStudentsPageAsync_ReturnsDeterministicBoundedPages()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Guid firstAdditionalId = Guid.Parse("66666666-6666-6666-6666-666666666666");
        Guid secondAdditionalId = Guid.Parse("77777777-7777-7777-7777-777777777777");
        User firstAdditional = ServiceTestData.CreateUser(firstAdditionalId, "Ana", "Alumna", "Estudiante", true);
        User secondAdditional = ServiceTestData.CreateUser(secondAdditionalId, "Berta", "Alumna", "Estudiante", true);
        context.Accounts.AddRange(
            ServiceTestData.CreateAccount(firstAdditional, "ana@itbeltran.test"),
            ServiceTestData.CreateAccount(secondAdditional, "berta@itbeltran.test"));
        context.UserCareers.AddRange(
            new UserCareer { UserId = firstAdditionalId, CareerId = ServiceTestData.CareerId },
            new UserCareer { UserId = secondAdditionalId, CareerId = ServiceTestData.CareerId });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        AcademicStudentPage first = await service.GetAcademicStudentsPageAsync(
            ServiceTestData.TeacherUserId,
            "Profesor",
            ServiceTestData.SubjectId,
            2,
            null);
        AcademicStudentPage second = await service.GetAcademicStudentsPageAsync(
            ServiceTestData.TeacherUserId,
            "Profesor",
            ServiceTestData.SubjectId,
            2,
            first.NextCursor);

        Assert.Equal(3, first.TotalCount);
        Assert.Collection(
            first.Items,
            student => Assert.Equal(firstAdditionalId, student.Id),
            student => Assert.Equal(secondAdditionalId, student.Id));
        Assert.True(first.HasNextPage);
        Assert.Single(second.Items);
        Assert.Equal(ServiceTestData.StudentUserId, second.Items[0].Id);
        Assert.False(second.HasNextPage);
    }

    [Fact]
    public async Task GetAcademicStudentsPageAsync_RejectsUnauthorizedRoleBeforeQuerying()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.GetAcademicStudentsPageAsync(
                ServiceTestData.StudentUserId,
                "Estudiante",
                ServiceTestData.SubjectId,
                25,
                null));

        Assert.Contains("permisos", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetAcademicStudentsPageAsync_RejectsProfessorOutsideSubjectCareer()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        UserCareer professorLink = await context.UserCareers.SingleAsync(link =>
            link.UserId == ServiceTestData.TeacherUserId &&
            link.CareerId == ServiceTestData.CareerId);
        context.UserCareers.Remove(professorLink);
        await context.SaveChangesAsync();
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.GetAcademicStudentsPageAsync(
                ServiceTestData.TeacherUserId,
                "Profesor",
                ServiceTestData.SubjectId,
                25,
                null));

        Assert.Contains("carreras asignadas", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetAcademicStudentsPageAsync_PropagatesCancellation()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            service.GetAcademicStudentsPageAsync(
                ServiceTestData.TeacherUserId,
                "Profesor",
                ServiceTestData.SubjectId,
                25,
                null,
                cancellation.Token));
    }

    [Fact]
    public async Task UpsertAcademicProgressAsync_RejectsNonStudentTarget()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpsertAcademicProgressAsync(
                ServiceTestData.AdminUserId,
                "Administrador",
                ServiceTestData.TeacherUserId,
                ServiceTestData.SubjectId,
                8,
                AcademicProgressStatus.Regular,
                null));

        Assert.Contains("estudiantes", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.AcademicProgressRecords);
    }

    [Fact]
    public async Task UpsertAcademicProgressAsync_RejectsStudentOutsideSubjectCareer()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpsertAcademicProgressAsync(
                ServiceTestData.TeacherUserId,
                "Profesor",
                ServiceTestData.OtherStudentUserId,
                ServiceTestData.SubjectId,
                7,
                AcademicProgressStatus.Regular,
                "Intento fuera de carrera"));

        Assert.Contains("no pertenece", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.AcademicProgressRecords);
    }

    [Fact]
    public async Task UpsertAcademicProgressAsync_RejectsProfessorOutsideSubjectCareer()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        UserCareer professorLink = await context.UserCareers.SingleAsync(link =>
            link.UserId == ServiceTestData.TeacherUserId &&
            link.CareerId == ServiceTestData.CareerId);
        context.UserCareers.Remove(professorLink);
        await context.SaveChangesAsync();
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpsertAcademicProgressAsync(
                ServiceTestData.TeacherUserId,
                "Profesor",
                ServiceTestData.StudentUserId,
                ServiceTestData.SubjectId,
                8,
                AcademicProgressStatus.Approved,
                null));

        Assert.Contains("carreras asignadas", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.AcademicProgressRecords);
        notifications.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task UpsertAcademicProgressAsync_ManagerCreatesProgressAndNotifiesStudent()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        AcademicProgress progress = await service.UpsertAcademicProgressAsync(
            ServiceTestData.TeacherUserId,
            "Profesor",
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            8.756m,
            AcademicProgressStatus.Approved,
            "Final aprobado");

        Assert.Equal(ServiceTestData.StudentUserId, progress.UserId);
        Assert.Equal(ServiceTestData.SubjectId, progress.SubjectId);
        Assert.Equal(ServiceTestData.TeacherUserId, progress.AssignedById);
        Assert.Equal(8.76m, progress.Score);
        Assert.Equal(AcademicProgressStatus.Approved, progress.Status);
        Assert.Single(context.AcademicProgressRecords);
        notifications.Verify(
            service => service.CreateNotificationsAsync(
                It.Is<IReadOnlyCollection<Guid>>(ids => ids.SequenceEqual(new[] { ServiceTestData.StudentUserId })),
                NotificationType.AcademicProgress,
                It.Is<string>(message => message.Contains("Programacion I", StringComparison.Ordinal)),
                "/academic",
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task SyncSiuGradesAsync_RejectsNonAdminRoleBeforeCallingAdapter()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SyncSiuGradesAsync(ServiceTestData.TeacherUserId, "Profesor", ServiceTestData.SubjectId));

        Assert.Contains("Administrador", exception.Message, StringComparison.Ordinal);
        siu.Verify(
            service => service.GetGradesAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()),
            Times.Never);
        notifications.Verify(
            service => service.CreateNotificationsAsync(
                It.IsAny<IReadOnlyCollection<Guid>>(),
                It.IsAny<NotificationType>(),
                It.IsAny<string>(),
                It.IsAny<string?>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task SyncSiuGradesAsync_CreatesThenUpdatesProgressWithoutDuplicates()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        siu.SetupSequence(service => service.GetGradesAsync(ServiceTestData.SubjectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[]
            {
                new SiuGradeRecord("student@itbeltran.test", 7.5m, AcademicProgressStatus.Regular, "Primer sync"),
                new SiuGradeRecord("missing@itbeltran.test", 5m, AcademicProgressStatus.Regular, "Sin cuenta")
            })
            .ReturnsAsync(new[]
            {
                new SiuGradeRecord("student@itbeltran.test", 9m, AcademicProgressStatus.Approved, "Segundo sync")
            });
        var service = new AcademicService(context, notifications.Object, siu.Object);

        SiuSyncResult first = await service.SyncSiuGradesAsync(
            ServiceTestData.AdminUserId,
            "Administrador",
            ServiceTestData.SubjectId);
        SiuSyncResult second = await service.SyncSiuGradesAsync(
            ServiceTestData.AdminUserId,
            "Administrador",
            ServiceTestData.SubjectId);

        Assert.Equal(1, first.Created);
        Assert.Equal(0, first.Updated);
        Assert.Equal(1, first.Skipped);
        Assert.Equal(0, second.Created);
        Assert.Equal(1, second.Updated);
        Assert.Single(context.AcademicProgressRecords);
        AcademicProgress persisted = Assert.Single(context.AcademicProgressRecords);
        Assert.Equal(9m, persisted.Score);
        Assert.Equal(AcademicProgressStatus.Approved, persisted.Status);
        notifications.Verify(
            service => service.CreateNotificationsAsync(
                It.Is<IReadOnlyCollection<Guid>>(ids => ids.SequenceEqual(new[] { ServiceTestData.StudentUserId })),
                NotificationType.SiuSync,
                It.Is<string>(message => message.Contains("SIU Guarani", StringComparison.Ordinal)),
                "/academic?subjectId=101",
                It.IsAny<CancellationToken>()),
            Times.Exactly(2));
    }

    private static Mock<INotificationService> CreateNotificationMock()
    {
        var notifications = new Mock<INotificationService>(MockBehavior.Strict);
        notifications
            .Setup(service => service.CreateNotificationsAsync(
                It.IsAny<IReadOnlyCollection<Guid>>(),
                It.IsAny<NotificationType>(),
                It.IsAny<string>(),
                It.IsAny<string?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Notification>());

        return notifications;
    }

    private static async Task SeedResourcesAsync(OneItb.Data.OneItbContext context)
    {
        context.AcademicResources.AddRange(
            new AcademicResource
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                SubjectId = ServiceTestData.SubjectId,
                UploaderId = ServiceTestData.TeacherUserId,
                Title = "Parcial resuelto",
                Description = "Modelo de parcial con soluciones",
                ExternalUrl = "https://itbeltran.test/parcial",
                ResourceType = "Link",
                Category = AcademicResourceCategory.Examen,
                Version = 2,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                IsActive = true
            },
            new AcademicResource
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                SubjectId = ServiceTestData.SubjectId,
                UploaderId = ServiceTestData.TeacherUserId,
                Title = "Libro base",
                Description = "Bibliografia principal",
                ExternalUrl = "https://itbeltran.test/libro",
                ResourceType = "Link",
                Category = AcademicResourceCategory.Libro,
                Version = 1,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            });

        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
    }
}
