using OneItb.Entities.Models;

namespace Services.Notifications
{
    public interface INotificationService
    {
        Task<IReadOnlyList<Notification>> GetNotificationsAsync(Guid userId, int first);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task<IReadOnlyList<NotificationPreference>> GetPreferencesAsync(Guid userId);
        Task<NotificationPreference> UpdatePreferenceAsync(Guid userId, NotificationType type, bool isEnabled);
        Task<Notification> MarkReadAsync(Guid userId, Guid notificationId);
        Task<int> MarkAllReadAsync(Guid userId);
        Task<IReadOnlyList<Notification>> CreateNotificationsAsync(
            IReadOnlyCollection<Guid> userIds,
            NotificationType type,
            string message,
            string? actionUrl);
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
