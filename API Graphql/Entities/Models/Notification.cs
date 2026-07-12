using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Notification : EntityModel<Guid>
    {
        public Guid UserId { get; set; }
        public NotificationType Type { get; set; }
        public string Message { get; set; } = default!;
        public string? ActionUrl { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? GroupKey { get; set; }
        public int AggregateCount { get; set; } = 1;
        public Guid? RelatedInquiryId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        public virtual User User { get; set; } = default!;
        public virtual Inquiry? RelatedInquiry { get; set; }
    }
}
