using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Social
{
    public class SocialService : ISocialService
    {
        private readonly OneItbContext _context;

        public SocialService(OneItbContext context)
        {
            _context = context;
        }

        public IQueryable<Inquiry> GetInquiries()
        {
            return _context.Inquiries
                .AsNoTracking()
                .OrderByDescending(inquiry => inquiry.PublishDate);
        }

        public async Task<Inquiry> AddInquiryAsync(Guid userId, int subjectId, string title, string content, string? attachedFileUrl = null)
        {
            string normalizedTitle = RequireText(title, 200, "El título");
            string normalizedContent = RequireText(content, 10000, "El contenido");

            if (!await _context.Users.AnyAsync(user => user.Id == userId && user.IsActive))
                throw new InvalidOperationException("El usuario autenticado no está disponible.");

            if (!await _context.Subjects.AnyAsync(subject => subject.Id == subjectId))
                throw new InvalidOperationException("La materia seleccionada no existe.");

            var inquiry = new Inquiry
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                SubjectId = subjectId,
                Title = normalizedTitle,
                Content = normalizedContent,
                AttachedFileUrl = attachedFileUrl,
                PublishDate = DateTime.UtcNow
            };

            _context.Inquiries.Add(inquiry);
            await _context.SaveChangesAsync();
            return inquiry;
        }

        public async Task<Comment> AddCommentAsync(Guid userId, Guid inquiryId, string content, Guid? parentCommentId)
        {
            string normalizedContent = RequireText(content, 1000, "El comentario");

            if (!await _context.Inquiries.AnyAsync(inquiry => inquiry.Id == inquiryId))
                throw new InvalidOperationException("La publicación no existe.");

            if (!await _context.Users.AnyAsync(user => user.Id == userId && user.IsActive))
                throw new InvalidOperationException("El usuario autenticado no está disponible.");

            if (parentCommentId.HasValue)
            {
                var parentInquiryId = await _context.Comments
                    .Where(comment => comment.Id == parentCommentId.Value)
                    .Select(comment => (Guid?)comment.InquiryId)
                    .SingleOrDefaultAsync();

                if (!parentInquiryId.HasValue)
                    throw new InvalidOperationException("El comentario al que intentas responder no existe.");

                if (parentInquiryId.Value != inquiryId)
                    throw new InvalidOperationException("La respuesta debe pertenecer a la misma publicación.");
            }

            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                InquiryId = inquiryId,
                UserId = userId,
                ParentCommentId = parentCommentId,
                Content = normalizedContent,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<ToggleReactionPayload> ToggleReactionAsync(Guid userId, Guid inquiryId)
        {
            if (!await _context.Inquiries.AnyAsync(inquiry => inquiry.Id == inquiryId))
                throw new InvalidOperationException("La publicación no existe.");

            if (!await _context.Users.AnyAsync(user => user.Id == userId && user.IsActive))
                throw new InvalidOperationException("El usuario autenticado no está disponible.");

            var existingReaction = await _context.Reactions
                .SingleOrDefaultAsync(reaction => reaction.InquiryId == inquiryId && reaction.UserId == userId);

            bool isReacted;
            if (existingReaction is null)
            {
                _context.Reactions.Add(new Reaction
                {
                    Id = Guid.NewGuid(),
                    InquiryId = inquiryId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                });
                isReacted = true;
            }
            else
            {
                _context.Reactions.Remove(existingReaction);
                isReacted = false;
            }

            await _context.SaveChangesAsync();
            int reactionCount = await _context.Reactions.CountAsync(reaction => reaction.InquiryId == inquiryId);
            return new ToggleReactionPayload(inquiryId, isReacted, reactionCount);
        }

        private static string RequireText(string value, int maxLength, string fieldName)
        {
            string normalized = value?.Trim() ?? string.Empty;
            if (normalized.Length == 0)
                throw new ArgumentException($"{fieldName} no puede estar vacío.");
            if (normalized.Length > maxLength)
                throw new ArgumentException($"{fieldName} no puede superar {maxLength} caracteres.");
            return normalized;
        }
    }
}
