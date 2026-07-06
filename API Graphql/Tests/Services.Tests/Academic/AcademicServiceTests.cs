using Moq;
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
    public async Task AddAcademicResourceAsync_EnrolledStudentPersistsCategoryVersionAndNotifies()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        AcademicResource resource = await service.AddAcademicResourceAsync(
            ServiceTestData.StudentUserId,
            "Estudiante",
            ServiceTestData.SubjectId,
            "Guia de laboratorio",
            "Practica de arrays",
            AcademicResourceCategory.Apunte,
            3,
            "/uploads/guia.pdf",
            null);

        Assert.Equal(ServiceTestData.StudentUserId, resource.UploaderId);
        Assert.Equal(AcademicResourceCategory.Apunte, resource.Category);
        Assert.Equal(3, resource.Version);
        Assert.Equal("File", resource.ResourceType);
        Assert.True(resource.IsActive);
        notifications.Verify(
            service => service.CreateNotificationsAsync(
                It.IsAny<IReadOnlyCollection<Guid>>(),
                NotificationType.AcademicResource,
                It.Is<string>(message => message.Contains("Guia de laboratorio", StringComparison.Ordinal)),
                "/academic?subjectId=101"),
            Times.Once);
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
            ServiceTestData.StudentUserId,
            "Estudiante",
            ServiceTestData.SubjectId,
            "Apunte a remover",
            null,
            AcademicResourceCategory.Otro,
            1,
            null,
            "https://itbeltran.test/apunte");

        AcademicResource deleted = await service.DeleteResourceAsync(
            ServiceTestData.StudentUserId,
            "Estudiante",
            resource.Id);
        IReadOnlyList<AcademicResource> visible = await service.GetAcademicResourcesAsync(
            ServiceTestData.StudentUserId,
            "Estudiante",
            ServiceTestData.SubjectId,
            null,
            null);

        Assert.False(deleted.IsActive);
        Assert.Empty(visible);
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
                It.IsAny<string?>()),
            Times.Never);
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
                "/academic"),
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
                It.IsAny<string?>()),
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
                "/academic?subjectId=101"),
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
                It.IsAny<string?>()))
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
