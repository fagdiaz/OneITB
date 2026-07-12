using System;
using System.Collections.Generic;

namespace OneItb.Entities.Models
{
    public class Comment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid InquiryId { get; set; }
        public Guid UserId { get; set; }
        public Guid? ParentCommentId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        public virtual Inquiry Inquiry { get; set; } = default!;
        public virtual User User { get; set; } = default!;
        public virtual Comment? ParentComment { get; set; }
        public virtual ICollection<Comment> Replies { get; set; } = new List<Comment>();
        public virtual ICollection<SocialAttachment> Attachments { get; set; } = new List<SocialAttachment>();
        public virtual ICollection<CommentReaction> Reactions { get; set; } = new List<CommentReaction>();
    }
}
