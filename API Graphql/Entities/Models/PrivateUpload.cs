using System;

namespace OneItb.Entities.Models
{
    public class PrivateUpload
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OwnerId { get; set; }
        public string StorageKey { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long ByteSize { get; set; }
        public DateTime ExpiresAtUtc { get; set; }
        public bool IsConsumed { get; set; } = false;
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public virtual User Owner { get; set; } = default!;
    }
}
