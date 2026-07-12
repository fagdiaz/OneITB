using System;

namespace OneItb.Entities.Models
{
    public class SocialAttachment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? InquiryId { get; set; }
        public Guid? CommentId { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = "application/octet-stream";
        public long Size { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Inquiry? Inquiry { get; set; }
        public virtual Comment? Comment { get; set; }
    }
}
