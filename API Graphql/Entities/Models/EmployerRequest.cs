using System;

namespace OneItb.Entities.Models
{
    public class EmployerRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string CompanyName { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string TaxId { get; set; } = string.Empty;
        public string? Comments { get; set; }
        public EmployerRequestStatus Status { get; set; } = EmployerRequestStatus.Pending;
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessedAt { get; set; }
        public Guid? ProcessedByAdminId { get; set; }
        public Guid? ProvisionedUserId { get; set; }
        public DateTime PrivacyConsentAt { get; set; } = DateTime.UtcNow;
        public EmployerEmailDeliveryStatus EmailDeliveryStatus { get; set; } =
            EmployerEmailDeliveryStatus.NotRequested;
        public DateTime? LastEmailAttemptAt { get; set; }
        public int EmailDeliveryAttempts { get; set; }
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        public virtual User? ProcessedByAdmin { get; set; }
        public virtual User? ProvisionedUser { get; set; }
        public virtual EmployerOnboardingOutboxMessage? OutboxMessage { get; set; }
    }
}
