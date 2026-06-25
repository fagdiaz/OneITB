using System;

namespace Services.Notifications
{
    public static class NotificationTopics
    {
        public static string ForUser(Guid userId) => $"notification:{userId:N}";
    }
}
