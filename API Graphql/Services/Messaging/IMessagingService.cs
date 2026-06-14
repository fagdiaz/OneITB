using System;
using System.Linq;
using System.Threading.Tasks;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public class MessagingContact
    {
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime? LastMessageAt { get; set; }
        public int UnreadCount { get; set; }
    }

    public record MarkConversationReadPayload(Guid OtherUserId, int MarkedCount);

    public interface IMessagingService
    {
        IQueryable<MessagingContact> GetContacts(Guid currentUserId);
        IQueryable<Message> GetConversation(Guid currentUserId, Guid otherUserId);
        IQueryable<User> GetActiveConversations(Guid currentUserId);
        IQueryable<Message> SearchMyMessages(Guid currentUserId, string searchTerm);
        Task<Message> SendMessageAsync(Guid senderId, Guid receiverId, string content);
        Task<MarkConversationReadPayload> MarkConversationReadAsync(Guid currentUserId, Guid otherUserId);
    }
}
