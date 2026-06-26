using System;

namespace OneItb.Entities.Models
{
    public class CommunityReport
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid InquiryId { get; set; }
        public Guid ReporterId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Inquiry Inquiry { get; set; } = default!;
        public virtual User Reporter { get; set; } = default!;
    }
}
