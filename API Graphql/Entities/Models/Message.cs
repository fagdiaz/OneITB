using System;
using System.Collections.Generic;

namespace OneItb.Entities.Models
{
    public class Message
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? ClientMessageId { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string? Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; }

        public virtual User Sender { get; set; } = default!;
        public virtual User Receiver { get; set; } = default!;
        public virtual ICollection<MessageAttachment> Attachments { get; set; } = new List<MessageAttachment>();
    }
}
