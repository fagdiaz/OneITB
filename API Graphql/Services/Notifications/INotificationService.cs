using OneItb.Entities.Models;

namespace Services.Notifications
{
    public interface INotificationService
    {
        Task<IReadOnlyList<Notification>> GetNotificationsAsync(Guid userId, int first, CancellationToken cancellationToken = default);
        Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<NotificationPreference>> GetPreferencesAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<NotificationPreference> UpdatePreferenceAsync(Guid userId, NotificationType type, bool isEnabled, CancellationToken cancellationToken = default);
        Task<Notification> MarkReadAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default);
        Task<int> MarkAllReadAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Notification>> CreateNotificationsAsync(
            IReadOnlyCollection<Guid> userIds,
            NotificationType type,
            string message,
            string? actionUrl,
            CancellationToken cancellationToken = default);
        Task<Notification?> UpsertGroupedNotificationAsync(
            Guid userId,
            NotificationType type,
            Guid relatedInquiryId,
            string groupKey,
            string singularMessage,
            string pluralMessageTemplate,
            CancellationToken cancellationToken = default,
            string? actionUrl = null);
        Task<Notification?> UpsertUnreadMessageReminderAsync(
            Guid userId,
            int unreadCount,
            DateTime latestUnreadMessageAt,
            CancellationToken cancellationToken = default);
    }
}
