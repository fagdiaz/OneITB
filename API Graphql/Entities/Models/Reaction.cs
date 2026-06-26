using System;

namespace OneItb.Entities.Models
{
    public class Reaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid InquiryId { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Inquiry Inquiry { get; set; } = default!;
        public virtual User User { get; set; } = default!;
    }
}

