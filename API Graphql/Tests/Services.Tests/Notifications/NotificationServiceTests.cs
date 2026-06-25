using HotChocolate.Subscriptions;
using Microsoft.Extensions.Logging;
using Moq;
using OneItb.Entities.Models;
using Services.Notifications;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Notifications;

public sealed class NotificationServiceTests
{
    [Fact]
    public async Task GetPreferencesAsync_CreatesDefaultPreferencesForEveryNotificationType()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedNotificationUsersAsync(context);
        NotificationService service = CreateService(context);

        IReadOnlyList<NotificationPreference> preferences = await service.GetPreferencesAsync(ServiceTestData.StudentUserId);

        Assert.Equal(Enum.GetValues<NotificationType>().Length, preferences.Count);
        Assert.All(preferences, preference => Assert.True(preference.IsEnabled));
        Assert.Equal(preferences.Count, context.NotificationPreferences.Count());
    }

    [Fact]
    public async Task CreateNotificationsAsync_SuppressesDisabledPreferencesAndInactiveUsers()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedNotificationUsersAsync(context);
        context.NotificationPreferences.Add(new NotificationPreference
        {
            Id = Guid.NewGuid(),
            UserId = ServiceTestData.StudentUserId,
            Type = NotificationType.AcademicResource,
            IsEnabled = false,
            UpdatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();
        Mock<ITopicEventSender> sender = CreateSenderMock();
        NotificationService service = CreateService(context, sender);

        IReadOnlyList<Notification> notifications = await service.CreateNotificationsAsync(
            new[] { ServiceTestData.StudentUserId, ServiceTestData.InactiveUserId },
            NotificationType.AcademicResource,
            "Nuevo apunte disponible",
            "/academic");

        Assert.Empty(notifications);
        Assert.Empty(context.Notifications);
        sender.Verify(
            service => service.SendAsync(
                It.IsAny<string>(),
                It.IsAny<Notification>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateNotificationsAsync_PersistsAndPublishesForActiveUsers()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedNotificationUsersAsync(context);
        Mock<ITopicEventSender> sender = CreateSenderMock();
        NotificationService service = CreateService(context, sender);

        IReadOnlyList<Notification> notifications = await service.CreateNotificationsAsync(
            new[] { ServiceTestData.StudentUserId, ServiceTestData.StudentUserId, ServiceTestData.InactiveUserId },
            NotificationType.AcademicProgress,
            "Se actualizo tu nota",
            "/academic");

        Notification notification = Assert.Single(notifications);
        Assert.Equal(ServiceTestData.StudentUserId, notification.UserId);
        Assert.False(notification.IsRead);
        Assert.Single(context.Notifications);
        sender.Verify(
            service => service.SendAsync(
                NotificationTopics.ForUser(ServiceTestData.StudentUserId),
                It.Is<Notification>(item => item.UserId == ServiceTestData.StudentUserId),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateNotificationsAsync_KeepsPersistedNotificationsWhenRealtimePublishFails()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedNotificationUsersAsync(context);
        var sender = new Mock<ITopicEventSender>(MockBehavior.Strict);
        sender
            .Setup(service => service.SendAsync(
                It.IsAny<string>(),
                It.IsAny<Notification>(),
                It.IsAny<CancellationToken>()))
            .Throws(new InvalidOperationException("WebSocket unavailable"));
        NotificationService service = CreateService(context, sender);

        IReadOnlyList<Notification> notifications = await service.CreateNotificationsAsync(
            new[] { ServiceTestData.StudentUserId },
            NotificationType.SiuSync,
            "Sincronizacion SIU finalizada",
            "/academic?subjectId=101");

        Assert.Single(notifications);
        Assert.Single(context.Notifications);
    }

    [Fact]
    public async Task MarkReadAsync_RejectsNotificationOwnedByAnotherUser()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedNotificationUsersAsync(context);
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = ServiceTestData.OtherStudentUserId,
            Type = NotificationType.AcademicResource,
            Message = "Privada",
            ActionUrl = "/academic",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        context.Notifications.Add(notification);
        await context.SaveChangesAsync();
        NotificationService service = CreateService(context);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.MarkReadAsync(ServiceTestData.StudentUserId, notification.Id));

        Assert.Contains("no encontrada", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.False(context.Notifications.Single().IsRead);
    }

    [Fact]
    public async Task MarkAllReadAsync_OnlyMarksCurrentUserNotifications()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedNotificationUsersAsync(context);
        context.Notifications.AddRange(
            CreateNotification(ServiceTestData.StudentUserId),
            CreateNotification(ServiceTestData.StudentUserId),
            CreateNotification(ServiceTestData.OtherStudentUserId));
        await context.SaveChangesAsync();
        NotificationService service = CreateService(context);

        int changed = await service.MarkAllReadAsync(ServiceTestData.StudentUserId);

        Assert.Equal(2, changed);
        Assert.All(
            context.Notifications.Where(notification => notification.UserId == ServiceTestData.StudentUserId),
            notification => Assert.True(notification.IsRead));
        Assert.False(context.Notifications.Single(notification => notification.UserId == ServiceTestData.OtherStudentUserId).IsRead);
    }

    private static NotificationService CreateService(
        OneItb.Data.OneItbContext context,
        Mock<ITopicEventSender>? sender = null)
    {
        return new NotificationService(
            context,
            (sender ?? CreateSenderMock()).Object,
            Mock.Of<ILogger<NotificationService>>());
    }

    private static Mock<ITopicEventSender> CreateSenderMock()
    {
        var sender = new Mock<ITopicEventSender>(MockBehavior.Strict);
        sender
            .Setup(service => service.SendAsync(
                It.IsAny<string>(),
                It.IsAny<Notification>(),
                It.IsAny<CancellationToken>()))
            .Returns(ValueTask.CompletedTask);

        return sender;
    }

    private static Notification CreateNotification(Guid userId)
    {
        return new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = NotificationType.AcademicResource,
            Message = "Mensaje de prueba",
            ActionUrl = "/academic",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
    }
}
