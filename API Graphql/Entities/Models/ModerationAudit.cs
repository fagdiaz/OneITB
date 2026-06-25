using System;

namespace OneItb.Entities.Models
{
    public class ModerationAudit
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ActorUserId { get; set; }
        public Guid? TargetUserId { get; set; }
        public Guid? TargetInquiryId { get; set; }
        public Guid? TargetCommentId { get; set; }
        public Guid? TargetReportId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User ActorUser { get; set; } = null!;
        public virtual User? TargetUser { get; set; }
        public virtual Inquiry? TargetInquiry { get; set; }
        public virtual Comment? TargetComment { get; set; }
        public virtual CommunityReport? TargetReport { get; set; }
    }
}
