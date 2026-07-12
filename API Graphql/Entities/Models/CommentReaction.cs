using System;

namespace OneItb.Entities.Models
{
    public class CommentReaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CommentId { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Comment Comment { get; set; } = default!;
        public virtual User User { get; set; } = default!;
    }
}
