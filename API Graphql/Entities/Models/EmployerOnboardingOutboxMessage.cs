using System;

namespace OneItb.Entities.Models
{
    public class EmployerOnboardingOutboxMessage
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid EmployerRequestId { get; set; }
        public EmployerOutboxStatus Status { get; set; } = EmployerOutboxStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime NextAttemptAt { get; set; } = DateTime.UtcNow;
        public DateTime? LeaseExpiresAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public int Attempts { get; set; }
        public string? LastErrorCode { get; set; }
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        public virtual EmployerRequest EmployerRequest { get; set; } = default!;
    }
}
