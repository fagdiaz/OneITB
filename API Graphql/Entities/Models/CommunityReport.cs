using System;

namespace OneItb.Entities.Models
{
    public class CommunityReport
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ReporterId { get; set; } // The user making the report
        public string ContentId { get; set; } = string.Empty; // E.g., PostId or CommentId
        public string ContentType { get; set; } = string.Empty; // "Post" or "Comment"
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // "Pending", "Resolved", "Dismissed"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property if we map it to User
        public virtual User Reporter { get; set; } = null!;
    }
}
