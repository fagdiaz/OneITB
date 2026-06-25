using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Notification : EntityModel<Guid>
    {
        public Guid UserId { get; set; }
        public NotificationType Type { get; set; }
        public string Message { get; set; } = null!;
        public string? ActionUrl { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }

        public virtual User User { get; set; } = null!;
    }
}
