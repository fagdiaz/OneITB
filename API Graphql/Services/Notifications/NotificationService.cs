using HotChocolate.Subscriptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneItb.Data;
using OneItb.Entities.Models;

namespace Services.Notifications
{
    public sealed class NotificationService : INotificationService
    {
        private const int MaxNotificationPageSize = 50;
        private readonly OneItbContext _context;
        private readonly ITopicEventSender _eventSender;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            OneItbContext context,
            ITopicEventSender eventSender,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _eventSender = eventSender;
            _logger = logger;
        }

        public async Task<IReadOnlyList<Notification>> GetNotificationsAsync(Guid userId, int first)
        {
            await EnsureActiveUserAsync(userId);
            int take = Math.Clamp(first, 1, MaxNotificationPageSize);

            return await NotificationGraph()
                .Where(notification => notification.UserId == userId)
                .OrderByDescending(notification => notification.UpdatedAt ?? notification.CreatedAt)
                .ThenByDescending(notification => notification.Id)
                .Take(take)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            await EnsureActiveUserAsync(userId);
            return await _context.Notifications
                .AsNoTracking()
                .CountAsync(notification => notification.UserId == userId && !notification.IsRead);
        }

        public async Task<IReadOnlyList<NotificationPreference>> GetPreferencesAsync(Guid userId)
        {
            await EnsureActiveUserAsync(userId);
            NotificationType[] types = Enum.GetValues<NotificationType>();
            List<NotificationPreference> existing = await _context.NotificationPreferences
                .Where(preference => preference.UserId == userId)
                .OrderBy(preference => preference.Type)
                .ToListAsync();

            var missing = types
                .Where(type => existing.All(preference => preference.Type != type))
                .Select(type => new NotificationPreference
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = type,
                    IsEnabled = true,
                    UpdatedAt = DateTime.UtcNow
                })
                .ToList();

            if (missing.Count > 0)
            {
                _context.NotificationPreferences.AddRange(missing);
                await _context.SaveChangesAsync();
                existing.AddRange(missing);
            }

            return existing.OrderBy(preference => preference.Type).ToList();
        }

        public async Task<NotificationPreference> UpdatePreferenceAsync(Guid userId, NotificationType type, bool isEnabled)
        {
            await EnsureActiveUserAsync(userId);

            NotificationPreference? preference = await _context.NotificationPreferences
                .SingleOrDefaultAsync(item => item.UserId == userId && item.Type == type);

            if (preference is null)
            {
                preference = new NotificationPreference
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = type
                };
                _context.NotificationPreferences.Add(preference);
            }

            preference.IsEnabled = isEnabled;
            preference.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return preference;
        }

        public async Task<Notification> MarkReadAsync(Guid userId, Guid notificationId)
        {
            await EnsureActiveUserAsync(userId);

            Notification notification = await _context.Notifications
                .SingleOrDefaultAsync(item => item.Id == notificationId && item.UserId == userId)
                ?? throw new InvalidOperationException("Notificacion no encontrada.");

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return await NotificationGraph()
                .SingleAsync(item => item.Id == notificationId && item.UserId == userId);
        }

        public async Task<int> MarkAllReadAsync(Guid userId)
        {
            await EnsureActiveUserAsync(userId);

            List<Notification> unread = await _context.Notifications
                .Where(notification => notification.UserId == userId && !notification.IsRead)
                .ToListAsync();

            foreach (Notification notification in unread)
                notification.IsRead = true;

            await _context.SaveChangesAsync();
            return unread.Count;
        }

        public async Task<IReadOnlyList<Notification>> CreateNotificationsAsync(
            IReadOnlyCollection<Guid> userIds,
            NotificationType type,
            string message,
            string? actionUrl)
        {
            string normalizedMessage = RequireText(message, 500, "El mensaje de notificacion");
            string? normalizedActionUrl = NormalizeActionUrl(actionUrl);

            Guid[] distinctUserIds = userIds
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToArray();

            if (distinctUserIds.Length == 0)
                return Array.Empty<Notification>();

            Guid[] activeUserIds = await _context.Users
                .AsNoTracking()
                .Where(user => distinctUserIds.Contains(user.Id) && user.IsActive)
                .Select(user => user.Id)
                .ToArrayAsync();

            if (activeUserIds.Length == 0)
                return Array.Empty<Notification>();

            Guid[] disabledUserIds = await _context.NotificationPreferences
                .AsNoTracking()
                .Where(preference =>
                    activeUserIds.Contains(preference.UserId) &&
                    preference.Type == type &&
                    !preference.IsEnabled)
                .Select(preference => preference.UserId)
                .ToArrayAsync();

            var notifications = activeUserIds
                .Where(userId => !disabledUserIds.Contains(userId))
                .Select(userId => new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = type,
                    Message = normalizedMessage,
                    ActionUrl = normalizedActionUrl,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                })
                .ToList();

            if (notifications.Count == 0)
                return Array.Empty<Notification>();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            Guid[] notificationIds = notifications.Select(notification => notification.Id).ToArray();
            List<Notification> persisted = await NotificationGraph()
                .Where(notification => notificationIds.Contains(notification.Id))
                .OrderByDescending(notification => notification.CreatedAt)
                .ToListAsync();

            foreach (Notification notification in persisted)
            {
                try
                {
                    await _eventSender.SendAsync(NotificationTopics.ForUser(notification.UserId), notification);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(
                        ex,
                        "Notification {NotificationId} persisted but real-time publication failed.",
                        notification.Id);
                }
            }

            return persisted;
        }

        public async Task<Notification?> UpsertGroupedNotificationAsync(
            Guid userId,
            NotificationType type,
            Guid relatedInquiryId,
            string groupKey,
            string singularMessage,
            string pluralMessageTemplate,
            CancellationToken cancellationToken = default,
            string? actionUrl = null)
        {
            if (userId == Guid.Empty || relatedInquiryId == Guid.Empty)
                throw new ArgumentException("El destinatario y la publicacion son obligatorios.");

            string normalizedGroupKey = RequireText(groupKey, 160, "La clave de agrupacion");
            string normalizedSingular = RequireText(singularMessage, 500, "El mensaje singular");
            string normalizedPlural = RequireText(pluralMessageTemplate, 500, "El mensaje plural");
            if (!normalizedPlural.Contains("{count}", StringComparison.Ordinal))
                throw new ArgumentException("El mensaje plural debe incluir el marcador {count}.");

            bool canReceive = await _context.Users
                .AsNoTracking()
                .AnyAsync(user => user.Id == userId && user.IsActive, cancellationToken);
            if (!canReceive)
                return null;

            bool inquiryExists = await _context.Inquiries
                .AsNoTracking()
                .AnyAsync(inquiry => inquiry.Id == relatedInquiryId, cancellationToken);
            if (!inquiryExists)
                throw new InvalidOperationException("La publicacion relacionada no existe.");

            bool disabled = await _context.NotificationPreferences
                .AsNoTracking()
                .AnyAsync(
                    preference =>
                        preference.UserId == userId &&
                        preference.Type == type &&
                        !preference.IsEnabled,
                    cancellationToken);
            if (disabled)
                return null;

            string resolvedActionUrl = NormalizeActionUrl(actionUrl)
                ?? $"/feed?inquiryId={relatedInquiryId:D}";

            for (int attempt = 0; attempt < 3; attempt++)
            {
                Notification? notification = await _context.Notifications
                    .SingleOrDefaultAsync(
                        item => item.UserId == userId && item.GroupKey == normalizedGroupKey,
                        cancellationToken);
                bool isNew = notification is null;

                if (isNew)
                {
                    notification = new Notification
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Type = type,
                        Message = normalizedSingular,
                        ActionUrl = resolvedActionUrl,
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        GroupKey = normalizedGroupKey,
                        AggregateCount = 1,
                        RelatedInquiryId = relatedInquiryId
                    };
                    _context.Notifications.Add(notification);
                }
                else
                {
                    notification!.AggregateCount = checked(notification.AggregateCount + 1);
                    notification.Message = FormatGroupedMessage(
                        normalizedSingular,
                        normalizedPlural,
                        notification.AggregateCount);
                    notification.ActionUrl = resolvedActionUrl;
                    notification.IsRead = false;
                    notification.UpdatedAt = DateTime.UtcNow;
                    notification.RelatedInquiryId = relatedInquiryId;
                }

                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                    Notification persisted = await NotificationGraph()
                        .SingleAsync(item => item.Id == notification!.Id, cancellationToken);
                    await PublishAsync(persisted, cancellationToken);
                    return persisted;
                }
                catch (DbUpdateConcurrencyException) when (attempt < 2)
                {
                    _context.Entry(notification!).State = EntityState.Detached;
                }
                catch (DbUpdateException) when (isNew && attempt < 2)
                {
                    _context.Entry(notification!).State = EntityState.Detached;
                }
            }

            throw new InvalidOperationException("No se pudo actualizar la notificacion agrupada por concurrencia.");
        }

        public async Task<Notification?> UpsertUnreadMessageReminderAsync(
            Guid userId,
            int unreadCount,
            DateTime latestUnreadMessageAt,
            CancellationToken cancellationToken = default)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("El destinatario es obligatorio.");
            if (unreadCount <= 0)
                throw new ArgumentOutOfRangeException(nameof(unreadCount));

            bool canReceive = await _context.Users
                .AsNoTracking()
                .AnyAsync(user => user.Id == userId && user.IsActive, cancellationToken);
            if (!canReceive)
                return null;

            bool disabled = await _context.NotificationPreferences
                .AsNoTracking()
                .AnyAsync(
                    preference =>
                        preference.UserId == userId &&
                        preference.Type == NotificationType.PrivateMessage &&
                        !preference.IsEnabled,
                    cancellationToken);
            if (disabled)
                return null;

            string groupKey = $"private-message-reminder:{userId:D}";
            for (int attempt = 0; attempt < 3; attempt++)
            {
                Notification? notification = await _context.Notifications
                    .SingleOrDefaultAsync(
                        item => item.UserId == userId && item.GroupKey == groupKey,
                        cancellationToken);

                DateTime lastSignalAt = notification?.UpdatedAt ?? notification?.CreatedAt ?? DateTime.MinValue;
                if (notification is not null && latestUnreadMessageAt <= lastSignalAt)
                    return notification;

                bool isNew = notification is null;
                DateTime now = DateTime.UtcNow;
                string message = unreadCount == 1
                    ? "Tenes un mensaje privado sin leer."
                    : $"Tenes {unreadCount} mensajes privados sin leer.";

                if (isNew)
                {
                    notification = new Notification
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Type = NotificationType.PrivateMessage,
                        Message = message,
                        ActionUrl = "/chat",
                        IsRead = false,
                        CreatedAt = now,
                        UpdatedAt = now,
                        GroupKey = groupKey,
                        AggregateCount = unreadCount
                    };
                    _context.Notifications.Add(notification);
                }
                else
                {
                    notification!.Message = message;
                    notification.ActionUrl = "/chat";
                    notification.IsRead = false;
                    notification.UpdatedAt = now;
                    notification.AggregateCount = unreadCount;
                }

                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                    Notification persisted = await NotificationGraph()
                        .SingleAsync(item => item.Id == notification!.Id, cancellationToken);
                    await PublishAsync(persisted, cancellationToken);
                    return persisted;
                }
                catch (DbUpdateConcurrencyException) when (attempt < 2)
                {
                    _context.Entry(notification!).State = EntityState.Detached;
                }
                catch (DbUpdateException) when (isNew && attempt < 2)
                {
                    _context.Entry(notification!).State = EntityState.Detached;
                }
            }

            throw new InvalidOperationException("No se pudo actualizar el recordatorio de mensajes por concurrencia.");
        }

        private IQueryable<Notification> NotificationGraph()
        {
            return _context.Notifications
                .AsNoTracking()
                .Include(notification => notification.User);
        }

        private async Task PublishAsync(Notification notification, CancellationToken cancellationToken)
        {
            try
            {
                await _eventSender.SendAsync(
                    NotificationTopics.ForUser(notification.UserId),
                    notification,
                    cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Notification {NotificationId} persisted but real-time publication failed.",
                    notification.Id);
            }
        }

        private static string FormatGroupedMessage(
            string singularMessage,
            string pluralMessageTemplate,
            int count)
        {
            if (count <= 1)
                return singularMessage;

            string message = pluralMessageTemplate.Replace(
                "{count}",
                count.ToString(System.Globalization.CultureInfo.InvariantCulture),
                StringComparison.Ordinal);
            return RequireText(message, 500, "El mensaje agrupado");
        }

        private async Task EnsureActiveUserAsync(Guid userId)
        {
            bool exists = await _context.Users.AnyAsync(user => user.Id == userId && user.IsActive);
            if (!exists)
                throw new InvalidOperationException("Usuario no encontrado o inactivo.");
        }

        private static string RequireText(string value, int maxLength, string fieldName)
        {
            string normalized = value?.Trim() ?? string.Empty;
            if (normalized.Length == 0)
                throw new ArgumentException($"{fieldName} es obligatorio.");
            if (normalized.Length > maxLength)
                throw new ArgumentException($"{fieldName} no puede superar {maxLength} caracteres.");
            return normalized;
        }

        private static string? NormalizeActionUrl(string? actionUrl)
        {
            if (string.IsNullOrWhiteSpace(actionUrl))
                return null;

            string normalized = actionUrl.Trim();
            if (normalized.Length > 300 ||
                normalized.Contains("..", StringComparison.Ordinal) ||
                (!normalized.StartsWith("/", StringComparison.Ordinal) &&
                 !Uri.TryCreate(normalized, UriKind.Absolute, out _)))
            {
                throw new InvalidOperationException("La URL de accion de la notificacion no es valida.");
            }

            return normalized;
        }
    }
}
