using System;
using System.Collections.Generic;

namespace OneITB.GraphQL.Messaging
{
    public class PrivateMessageAttachment
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long Size { get; set; }
    }

    public class MessagingPeer
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
    }

    public class PrivateMessageInput
    {
        public Guid ReceiverId { get; set; }
        public Guid ClientMessageId { get; set; }
        public string? Content { get; set; }
        public IReadOnlyList<Guid> UploadIds { get; set; } = Array.Empty<Guid>();
    }
}
