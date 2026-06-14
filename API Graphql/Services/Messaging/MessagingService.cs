using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Messaging
{
    public class MessagingService : IMessagingService
    {
        private const int MaxContentLength = 2000;
        private readonly OneItbContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<MessagingService> _logger;

        public MessagingService(
            OneItbContext context,
            IUnitOfWork unitOfWork,
            ILogger<MessagingService> logger)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public IQueryable<MessagingContact> GetContacts(Guid currentUserId)
        {
            EnsureActiveUser(currentUserId);

            return _context.Users
                .AsNoTracking()
                .Where(user => user.Id != currentUserId && user.IsActive)
                .OrderBy(user => user.FirstName)
                .ThenBy(user => user.LastName)
                .ThenBy(user => user.Id)
                .Select(user => new MessagingContact
                {
                    UserId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role,
                    LastMessageAt = user.SentMessages
                        .Where(message => message.ReceiverId == currentUserId)
                        .Select(message => (DateTime?)message.SentAt)
                        .Concat(
                            user.ReceivedMessages
                                .Where(message => message.SenderId == currentUserId)
                                .Select(message => (DateTime?)message.SentAt))
                        .Max(),
                    UnreadCount = user.SentMessages.Count(message =>
                        message.ReceiverId == currentUserId &&
                        !message.IsRead)
                });
        }

        public IQueryable<User> GetActiveConversations(Guid currentUserId)
        {
            EnsureActiveUser(currentUserId);

            return _context.Users
                .AsNoTracking()
                .Where(user => user.Id != currentUserId && user.IsActive &&
                    (user.SentMessages.Any(m => m.ReceiverId == currentUserId) ||
                     user.ReceivedMessages.Any(m => m.SenderId == currentUserId)))
                .OrderBy(user => user.FirstName)
                .ThenBy(user => user.LastName)
                .ThenBy(user => user.Id);
        }

        public IQueryable<Message> SearchMyMessages(Guid currentUserId, string searchTerm)
        {
            EnsureActiveUser(currentUserId);

            if (string.IsNullOrWhiteSpace(searchTerm))
                return Enumerable.Empty<Message>().AsQueryable();

            string term = searchTerm.Trim();
            return _context.Messages
                .AsNoTracking()
                .Where(m => (m.SenderId == currentUserId || m.ReceiverId == currentUserId) &&
                            m.Content.Contains(term))
                .OrderByDescending(m => m.SentAt)
                .ThenByDescending(m => m.Id);
        }

        public IQueryable<Message> GetConversation(Guid currentUserId, Guid otherUserId)
        {
            EnsureParticipantPair(currentUserId, otherUserId);

            return _unitOfWork.Messages.Query()
                .Where(message =>
                    (message.SenderId == currentUserId && message.ReceiverId == otherUserId) ||
                    (message.SenderId == otherUserId && message.ReceiverId == currentUserId))
                .OrderByDescending(message => message.SentAt)
                .ThenByDescending(message => message.Id);
        }

        public async Task<Message> SendMessageAsync(Guid senderId, Guid receiverId, string content)
        {
            EnsureParticipantPair(senderId, receiverId);

            string normalizedContent = content?.Trim() ?? string.Empty;
            if (normalizedContent.Length == 0)
                throw new ArgumentException("El mensaje no puede estar vacío.", nameof(content));
            if (normalizedContent.Length > MaxContentLength)
                throw new ArgumentException($"El mensaje no puede superar los {MaxContentLength} caracteres.", nameof(content));

            var message = new Message
            {
                Id = Guid.NewGuid(),
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = normalizedContent,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            await _unitOfWork.Messages.AddAsync(message);
            await _unitOfWork.CompleteAsync();

            message.Sender = await _context.Users.AsNoTracking().SingleAsync(user => user.Id == senderId);
            message.Receiver = await _context.Users.AsNoTracking().SingleAsync(user => user.Id == receiverId);

            _logger.LogInformation(
                "Private message {MessageId} persisted from {SenderId} to {ReceiverId}.",
                message.Id,
                senderId,
                receiverId);

            return message;
        }

        public async Task<MarkConversationReadPayload> MarkConversationReadAsync(
            Guid currentUserId,
            Guid otherUserId)
        {
            EnsureParticipantPair(currentUserId, otherUserId);

            int markedCount = await _context.Messages
                .Where(message =>
                    message.SenderId == otherUserId &&
                    message.ReceiverId == currentUserId &&
                    !message.IsRead)
                .ExecuteUpdateAsync(setters => setters.SetProperty(message => message.IsRead, true));

            return new MarkConversationReadPayload(otherUserId, markedCount);
        }

        private void EnsureParticipantPair(Guid currentUserId, Guid otherUserId)
        {
            if (currentUserId == otherUserId)
                throw new ArgumentException("No podés iniciar una conversación con tu propio usuario.");

            EnsureActiveUser(currentUserId);

            bool otherUserIsActive = _context.Users
                .AsNoTracking()
                .Any(user => user.Id == otherUserId && user.IsActive);
            if (!otherUserIsActive)
                throw new ArgumentException("El usuario destinatario no existe o está inactivo.");
        }

        private void EnsureActiveUser(Guid userId)
        {
            bool userIsActive = _context.Users
                .AsNoTracking()
                .Any(user => user.Id == userId && user.IsActive);
            if (!userIsActive)
                throw new ArgumentException("El usuario autenticado no existe o está inactivo.");
        }
    }
}
