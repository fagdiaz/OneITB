using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using System.Text;

namespace Services.Social
{
    public class SocialService : ISocialService
    {
        private readonly OneItbContext _context;

        public SocialService(OneItbContext context)
        {
            _context = context;
        }

        public IQueryable<Inquiry> GetInquiries(Guid? currentUserId, string? searchTerm, int? careerId, int[]? careerIds, int[]? subjectIds)
        {
            IQueryable<Inquiry> query = _context.Inquiries
                .AsNoTracking()
                .Include(inquiry => inquiry.User)
                .ThenInclude(user => user.Account)
                .Include(inquiry => inquiry.Subject)
                .ThenInclude(subject => subject.Career)
                .Include(inquiry => inquiry.Reactions)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.User);

            string normalizedSearch = searchTerm?.Trim() ?? string.Empty;
            if (normalizedSearch.Length > 0)
            {
                query = query.Where(inquiry =>
                    inquiry.Title.Contains(normalizedSearch) ||
                    inquiry.Content.Contains(normalizedSearch) ||
                    inquiry.Subject.Name.Contains(normalizedSearch) ||
                    inquiry.Subject.Code.Contains(normalizedSearch) ||
                    inquiry.Subject.Career.Code.Contains(normalizedSearch) ||
                    inquiry.User.FirstName.Contains(normalizedSearch) ||
                    inquiry.User.LastName.Contains(normalizedSearch) ||
                    (inquiry.User.FirstName + " " + inquiry.User.LastName).Contains(normalizedSearch) ||
                    inquiry.User.Account.Email.Contains(normalizedSearch) ||
                    inquiry.Comments.Any(comment =>
                        comment.Content.Contains(normalizedSearch) ||
                        comment.User.FirstName.Contains(normalizedSearch) ||
                        comment.User.LastName.Contains(normalizedSearch) ||
                        (comment.User.FirstName + " " + comment.User.LastName).Contains(normalizedSearch)));
            }

            int[] normalizedCareerIds = careerIds is { Length: > 0 }
                ? careerIds.Distinct().ToArray()
                : careerId.HasValue
                    ? new[] { careerId.Value }
                    : Array.Empty<int>();

            if (normalizedCareerIds.Length > 0)
            {
                query = query.Where(inquiry => normalizedCareerIds.Contains(inquiry.Subject.CareerId));
            }

            if (subjectIds is { Length: > 0 })
            {
                query = query.Where(inquiry => subjectIds.Contains(inquiry.SubjectId));
            }

            if (!currentUserId.HasValue)
            {
                return query.OrderByDescending(inquiry => inquiry.PublishDate);
            }

            Guid observerId = currentUserId.Value;
            IQueryable<Guid> excludedUsers = _context.UserInteractions
                .Where(interaction =>
                    interaction.ObserverId == observerId &&
                    (interaction.Type == InteractionType.Mute || interaction.Type == InteractionType.Block))
                .Select(interaction => interaction.TargetId);

            IQueryable<Guid> followedUsers = _context.UserInteractions
                .Where(interaction =>
                    interaction.ObserverId == observerId &&
                    interaction.Type == InteractionType.Follow)
                .Select(interaction => interaction.TargetId);

            IQueryable<Inquiry> visibleQuery = query
                .Where(inquiry => !excludedUsers.Contains(inquiry.UserId));

            if (normalizedSearch.Length > 0)
            {
                return visibleQuery.OrderByDescending(inquiry => inquiry.PublishDate);
            }

            return visibleQuery
                .OrderByDescending(inquiry => followedUsers.Contains(inquiry.UserId))
                .ThenByDescending(inquiry => inquiry.PublishDate);
        }

        public async Task<InquiryPage> GetInquiriesPageAsync(
            Guid? currentUserId,
            string? searchTerm,
            int? careerId,
            int[]? careerIds,
            int[]? subjectIds,
            int first,
            string? after)
        {
            int pageSize = Math.Clamp(first, 1, 25);
            int offset = DecodeOffset(after);

            IQueryable<Inquiry> query = GetInquiries(currentUserId, searchTerm, careerId, careerIds, subjectIds);
            int totalCount = await query.CountAsync();
            List<Inquiry> pageItems = await query
                .Skip(offset)
                .Take(pageSize + 1)
                .ToListAsync();

            bool hasNextPage = pageItems.Count > pageSize;
            if (hasNextPage)
            {
                pageItems.RemoveAt(pageItems.Count - 1);
            }

            return new InquiryPage
            {
                Items = pageItems,
                HasNextPage = hasNextPage,
                NextCursor = hasNextPage ? EncodeOffset(offset + pageItems.Count) : string.Empty,
                TotalCount = totalCount
            };
        }

        public async Task<Inquiry> AddInquiryAsync(Guid userId, int subjectId, string title, string content, string? fileUrl = null)
        {
            await EnsureUserCanCreateContentAsync(userId, "publicar");
            string normalizedTitle = RequireText(title, 200, "El título");
            string normalizedContent = RequireText(content, 10000, "El contenido");

            string? normalizedFileUrl = NormalizeFileUrl(fileUrl);

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
                FileUrl = normalizedFileUrl,
                PublishDate = DateTime.UtcNow,
                IsActive = true
            };

            _context.Inquiries.Add(inquiry);
            await _context.SaveChangesAsync();
            return await LoadInquiryGraphAsync(inquiry.Id);
        }

        private static string? NormalizeFileUrl(string? fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
                return null;

            string normalized = fileUrl.Trim();
            if (normalized.Length > 500 ||
                !normalized.StartsWith("/uploads/", StringComparison.Ordinal) ||
                normalized.Contains("..", StringComparison.Ordinal))
            {
                throw new InvalidOperationException("La URL del archivo adjunto no es valida.");
            }

            return normalized;
        }

        private static string EncodeOffset(int offset)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes($"offset:{offset}"));
        }

        private static int DecodeOffset(string? cursor)
        {
            if (string.IsNullOrWhiteSpace(cursor))
                return 0;

            try
            {
                string decoded = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
                if (!decoded.StartsWith("offset:", StringComparison.Ordinal))
                    throw new FormatException();

                if (!int.TryParse(decoded["offset:".Length..], out int offset) || offset < 0)
                    throw new FormatException();

                return offset;
            }
            catch (FormatException)
            {
                throw new InvalidOperationException("Cursor de paginacion invalido.");
            }
        }

        public async Task<Inquiry> EditInquiryAsync(Guid userId, bool canModerate, Guid inquiryId, string newTitle, string newContent)
        {
            Inquiry inquiry = await _context.Inquiries
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(item => item.Id == inquiryId)
                ?? throw new InvalidOperationException("La publicaciÃ³n no existe.");

            if (inquiry.UserId != userId && !canModerate)
                throw new InvalidOperationException("No tenÃ©s permisos para editar esta publicaciÃ³n.");

            inquiry.Title = RequireText(newTitle, 200, "El tÃ­tulo");
            inquiry.Content = RequireText(newContent, 10000, "El contenido");
            inquiry.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return inquiry;
        }

        public async Task<Inquiry> ToggleInquiryStatusAsync(Guid userId, bool canModerate, Guid inquiryId)
        {
            Inquiry inquiry = await _context.Inquiries
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(item => item.Id == inquiryId)
                ?? throw new InvalidOperationException("La publicaciÃ³n no existe.");

            if (inquiry.UserId != userId && !canModerate)
                throw new InvalidOperationException("No tenÃ©s permisos para cambiar el estado de esta publicaciÃ³n.");

            inquiry.IsActive = !inquiry.IsActive;
            inquiry.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return inquiry;
        }

        public async Task<Comment> EditCommentAsync(Guid userId, bool canModerate, Guid commentId, string newContent)
        {
            Comment comment = await _context.Comments
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(item => item.Id == commentId)
                ?? throw new InvalidOperationException("El comentario no existe.");

            if (comment.UserId != userId && !canModerate)
                throw new InvalidOperationException("No tenÃ©s permisos para editar este comentario.");

            comment.Content = RequireText(newContent, 1000, "El comentario");
            comment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment> ToggleCommentStatusAsync(Guid userId, bool canModerate, Guid commentId)
        {
            Comment comment = await _context.Comments
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(item => item.Id == commentId)
                ?? throw new InvalidOperationException("El comentario no existe.");

            if (comment.UserId != userId && !canModerate)
                throw new InvalidOperationException("No tenÃ©s permisos para cambiar el estado de este comentario.");

            comment.IsActive = !comment.IsActive;
            comment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment> AddCommentAsync(Guid userId, Guid inquiryId, string content, Guid? parentCommentId, string? fileUrl = null)
        {
            await EnsureUserCanCreateContentAsync(userId, "comentar");
            string normalizedContent = RequireText(content, 1000, "El comentario");
            string? normalizedFileUrl = NormalizeFileUrl(fileUrl);

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
                FileUrl = normalizedFileUrl,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return await LoadCommentGraphAsync(comment.Id);
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

        private async Task EnsureUserCanCreateContentAsync(Guid userId, string action)
        {
            var userModerationState = await _context.Users
                .Where(user => user.Id == userId && user.IsActive)
                .Select(user => new { user.MutedUntil })
                .SingleOrDefaultAsync();

            if (userModerationState is null)
                throw new InvalidOperationException("El usuario autenticado no esta disponible.");

            if (userModerationState.MutedUntil.HasValue && userModerationState.MutedUntil.Value > DateTime.UtcNow)
                throw new InvalidOperationException($"Tu cuenta esta silenciada temporalmente y no puede {action}.");
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

        private async Task<Inquiry> LoadInquiryGraphAsync(Guid inquiryId)
        {
            return await _context.Inquiries
                .AsNoTracking()
                .Include(inquiry => inquiry.User)
                .ThenInclude(user => user.Account)
                .Include(inquiry => inquiry.Subject)
                .ThenInclude(subject => subject.Career)
                .Include(inquiry => inquiry.Reactions)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.User)
                .SingleAsync(inquiry => inquiry.Id == inquiryId);
        }

        private async Task<Comment> LoadCommentGraphAsync(Guid commentId)
        {
            return await _context.Comments
                .AsNoTracking()
                .Include(comment => comment.User)
                .Include(comment => comment.Inquiry)
                .SingleAsync(comment => comment.Id == commentId);
        }
    }
}
