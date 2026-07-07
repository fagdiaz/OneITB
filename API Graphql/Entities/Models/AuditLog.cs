using System;

namespace OneItb.Entities.Models
{
    public class AuditLog
    {
        public Guid Id { get; set; }
        public Guid? ActorUserId { get; set; }
        public string? CorrelationId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string? OldValuesJson { get; set; }
        public string? NewValuesJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User? ActorUser { get; set; }
    }
}
