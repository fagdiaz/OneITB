using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class NotificationPreference : EntityModel<Guid>
    {
        public Guid UserId { get; set; }
        public NotificationType Type { get; set; }
        public bool IsEnabled { get; set; } = true;
        public DateTime UpdatedAt { get; set; }

        public virtual User User { get; set; } = default!;
    }
}
