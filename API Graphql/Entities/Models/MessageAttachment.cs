using System;

namespace OneItb.Entities.Models
{
    public class MessageAttachment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid MessageId { get; set; }
        public Guid UploadId { get; set; }
        public int OrderIndex { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long ByteSize { get; set; }

        public virtual Message Message { get; set; } = default!;
        public virtual PrivateUpload Upload { get; set; } = default!;
    }
}
