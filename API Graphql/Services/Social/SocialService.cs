using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using Services.Notifications;
using System.Text;

namespace Services.Social
{
    public class SocialService : ISocialService
    {
        private const int MaxAttachmentCount = 10;
        private const long MaxAttachmentBytes = 15 * 1024 * 1024;

        private static readonly HashSet<string> AllowedAttachmentContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/zip",
            "application/x-zip-compressed",
            "text/plain",
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp",
            "video/mp4",
            "video/webm"
        };

        private readonly OneItbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<SocialService> _logger;

        public SocialService(
            OneItbContext context,
            INotificationService notificationService,
            ILogger<SocialService> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        public IQueryable<Inquiry> GetInquiries(
            Guid? currentUserId,
            string? searchTerm,
            int? careerId,
            int[]? careerIds,
            int[]? subjectIds,
            Guid? inquiryId = null)
        {
            IQueryable<Inquiry> query = _context.Inquiries
                .AsNoTracking()
                .AsSplitQuery()
                .Include(inquiry => inquiry.User)
                .ThenInclude(user => user.Account)
                .Include(inquiry => inquiry.Subject)
                .ThenInclude(subject => subject.Career)
                .Include(inquiry => inquiry.Attachments)
                .Include(inquiry => inquiry.Reactions)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.User)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.ReplyToUser)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.Attachments)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.Reactions)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.Replies)
                .ThenInclude(reply => reply.User);

            if (inquiryId.HasValue)
            {
                Guid selectedInquiryId = inquiryId.Value;
                query = query.Where(inquiry => inquiry.Id == selectedInquiryId);
            }

            string normalizedSearch = searchTerm?.Trim() ?? string.Empty;
            if (normalizedSearch.Length > 0)
            {
                string normalizedSearchLower = normalizedSearch.ToLower();
                query = query.Where(inquiry =>
                    inquiry.Title.ToLower().Contains(normalizedSearchLower) ||
                    inquiry.Content.ToLower().Contains(normalizedSearchLower) ||
                    inquiry.Subject.Name.ToLower().Contains(normalizedSearchLower) ||
                    inquiry.Subject.Code.ToLower().Contains(normalizedSearchLower) ||
                    inquiry.Subject.Career.Code.ToLower().Contains(normalizedSearchLower) ||
                    inquiry.User.FirstName.ToLower().Contains(normalizedSearchLower) ||
                    inquiry.User.LastName.ToLower().Contains(normalizedSearchLower) ||
                    (inquiry.User.FirstName + " " + inquiry.User.LastName).ToLower().Contains(normalizedSearchLower) ||
                    inquiry.User.Account.Email.ToLower().Contains(normalizedSearchLower) ||
                    inquiry.Comments.Any(comment =>
                        comment.Content.ToLower().Contains(normalizedSearchLower) ||
                        comment.User.FirstName.ToLower().Contains(normalizedSearchLower) ||
                        comment.User.LastName.ToLower().Contains(normalizedSearchLower) ||
                        (comment.User.FirstName + " " + comment.User.LastName).ToLower().Contains(normalizedSearchLower)));
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
                return query
                    .Where(inquiry => false)
                    .OrderByDescending(inquiry => inquiry.PublishDate);
            }

            Guid observerId = currentUserId.Value;
            bool hasGlobalCareerVisibility = _context.Users.Any(user =>
                user.Id == observerId &&
                (user.Role == "Administrador" || user.Role == "Moderador"));

            if (!hasGlobalCareerVisibility)
            {
                IQueryable<int> observerCareerIds = _context.UserCareers
                    .Where(link => link.UserId == observerId && link.Career.IsActive)
                    .Select(link => link.CareerId);

                query = query.Where(inquiry => observerCareerIds.Contains(inquiry.Subject.CareerId));
            }

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
            string? after,
            Guid? inquiryId = null)
        {
            int pageSize = Math.Clamp(first, 1, 25);
            int offset = DecodeOffset(after);

            IQueryable<Inquiry> query = GetInquiries(currentUserId, searchTerm, careerId, careerIds, subjectIds, inquiryId);
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

        public async Task<Inquiry> AddInquiryAsync(
            Guid userId,
            int subjectId,
            string title,
            string content,
            string? fileUrl = null,
            IReadOnlyList<SocialAttachmentInput>? attachments = null,
            bool preferAttachmentCover = false,
            CancellationToken cancellationToken = default)
        {
            await EnsureUserCanCreateContentAsync(userId, "publicar", cancellationToken);
            string normalizedTitle = RequireText(title, 200, "El título");
            string normalizedContent = RequireText(content, 10000, "El contenido");

            string role = await _context.Users
                .AsNoTracking()
                .Where(user => user.Id == userId && user.IsActive)
                .Select(user => user.Role)
                .SingleAsync(cancellationToken);

            var subjectScope = await _context.Subjects
                .AsNoTracking()
                .Where(subject => subject.Id == subjectId && subject.IsActive && subject.Career.IsActive)
                .Select(subject => new { subject.Id, subject.CareerId })
                .SingleOrDefaultAsync(cancellationToken);
            if (subjectScope is null)
                throw new InvalidOperationException("La materia seleccionada no existe o esta inactiva.");

            if (!role.Equals("Administrador", StringComparison.OrdinalIgnoreCase))
            {
                bool belongsToCareer = await _context.UserCareers
                    .AsNoTracking()
                    .AnyAsync(link => link.UserId == userId && link.CareerId == subjectScope.CareerId, cancellationToken);
                if (!belongsToCareer)
                    throw new InvalidOperationException("Solo podes publicar en materias de tus carreras.");
            }

            Guid inquiryId = Guid.NewGuid();
            List<SocialAttachment> normalizedAttachments = NormalizeAttachments(
                attachments,
                fileUrl,
                inquiryId,
                null);

            var inquiry = new Inquiry
            {
                Id = inquiryId,
                UserId = userId,
                SubjectId = subjectId,
                Title = normalizedTitle,
                Content = normalizedContent,
                FileUrl = normalizedAttachments.FirstOrDefault()?.FileUrl,
                PublishDate = DateTime.UtcNow,
                IsActive = true,
                PreferAttachmentCover = preferAttachmentCover && normalizedAttachments.Count > 0,
                Attachments = normalizedAttachments
            };

            _context.Inquiries.Add(inquiry);
            await _context.SaveChangesAsync(cancellationToken);
            return await LoadInquiryGraphAsync(inquiry.Id, cancellationToken);
        }

        private static string? NormalizeFileUrl(string? fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
                return null;

            string normalized = fileUrl.Trim();
            if (normalized.Length > 500 ||
                normalized.Contains("..", StringComparison.Ordinal) ||
                (!normalized.StartsWith("/uploads/", StringComparison.Ordinal) &&
                 !IsAllowedCloudinaryUrl(normalized)))
            {
                throw new InvalidOperationException("La URL del archivo adjunto no es valida.");
            }

            return normalized;
        }

        private static bool IsAllowedCloudinaryUrl(string value)
        {
            return Uri.TryCreate(value, UriKind.Absolute, out Uri? parsed) &&
                parsed.Scheme == Uri.UriSchemeHttps &&
                (parsed.Host.Equals("res.cloudinary.com", StringComparison.OrdinalIgnoreCase) ||
                 parsed.Host.EndsWith(".cloudinary.com", StringComparison.OrdinalIgnoreCase));
        }

        private static List<SocialAttachment> NormalizeAttachments(
            IReadOnlyList<SocialAttachmentInput>? inputs,
            string? legacyFileUrl,
            Guid? inquiryId,
            Guid? commentId)
        {
            if (inquiryId.HasValue == commentId.HasValue)
                throw new InvalidOperationException("El adjunto debe pertenecer a una publicacion o comentario.");

            IReadOnlyList<SocialAttachmentInput> normalizedInputs = inputs ?? Array.Empty<SocialAttachmentInput>();
            if (normalizedInputs.Count == 0 && !string.IsNullOrWhiteSpace(legacyFileUrl))
            {
                string normalizedLegacyUrl = NormalizeFileUrl(legacyFileUrl)!;
                normalizedInputs = new[]
                {
                    new SocialAttachmentInput(
                        normalizedLegacyUrl,
                        GetFileNameFromUrl(normalizedLegacyUrl),
                        InferLegacyContentType(normalizedLegacyUrl),
                        0,
                        0)
                };
            }

            if (normalizedInputs.Count > MaxAttachmentCount)
                throw new InvalidOperationException($"No podes adjuntar mas de {MaxAttachmentCount} archivos.");

            int[] sortOrders = normalizedInputs.Select(input => input.SortOrder).ToArray();
            if (sortOrders.Any(order => order < 0 || order >= MaxAttachmentCount) ||
                sortOrders.Distinct().Count() != sortOrders.Length)
            {
                throw new InvalidOperationException("El orden de los archivos adjuntos no es valido.");
            }

            long aggregateSize = 0;
            var urls = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var result = new List<SocialAttachment>(normalizedInputs.Count);

            foreach (SocialAttachmentInput input in normalizedInputs.OrderBy(item => item.SortOrder))
            {
                string normalizedUrl = NormalizeFileUrl(input.FileUrl)
                    ?? throw new InvalidOperationException("La URL del archivo adjunto es obligatoria.");
                if (!urls.Add(normalizedUrl))
                    throw new InvalidOperationException("No se puede adjuntar el mismo archivo mas de una vez.");

                string originalFileName = Path.GetFileName(input.OriginalFileName?.Trim()) ?? string.Empty;
                if (string.IsNullOrWhiteSpace(originalFileName) ||
                    originalFileName.Length > 255 ||
                    originalFileName.Any(char.IsControl))
                {
                    throw new InvalidOperationException("El nombre original del archivo no es valido.");
                }

                string contentType = input.ContentType?.Trim().ToLowerInvariant() ?? string.Empty;
                bool isLegacyInput = input.Size == 0 && normalizedInputs.Count == 1 && inputs is null;
                if (!isLegacyInput && !AllowedAttachmentContentTypes.Contains(contentType))
                    throw new InvalidOperationException("El tipo del archivo adjunto no esta permitido.");
                if (input.Size < 0 || input.Size > MaxAttachmentBytes || (!isLegacyInput && input.Size == 0))
                    throw new InvalidOperationException("El tamano del archivo adjunto no es valido.");

                aggregateSize = checked(aggregateSize + input.Size);
                if (aggregateSize > MaxAttachmentBytes)
                    throw new InvalidOperationException("Los archivos adjuntos superan el limite total de 15 MB.");

                result.Add(new SocialAttachment
                {
                    Id = Guid.NewGuid(),
                    InquiryId = inquiryId,
                    CommentId = commentId,
                    FileUrl = normalizedUrl,
                    OriginalFileName = originalFileName,
                    ContentType = isLegacyInput ? InferLegacyContentType(normalizedUrl) : contentType,
                    Size = input.Size,
                    SortOrder = input.SortOrder,
                    CreatedAt = DateTime.UtcNow
                });
            }

            return result;
        }

        private static string GetFileNameFromUrl(string fileUrl)
        {
            if (Uri.TryCreate(fileUrl, UriKind.Absolute, out Uri? absolute))
                return Uri.UnescapeDataString(Path.GetFileName(absolute.LocalPath));

            return Uri.UnescapeDataString(Path.GetFileName(fileUrl));
        }

        private static string InferLegacyContentType(string fileUrl)
        {
            string extension = Path.GetExtension(
                Uri.TryCreate(fileUrl, UriKind.Absolute, out Uri? absolute)
                    ? absolute.LocalPath
                    : fileUrl).ToLowerInvariant();

            return extension switch
            {
                ".pdf" => "application/pdf",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                ".mp4" => "video/mp4",
                ".webm" => "video/webm",
                _ => "application/octet-stream"
            };
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

        public async Task<Inquiry> EditInquiryAsync(
            Guid userId,
            Guid inquiryId,
            string newTitle,
            string newContent,
            IReadOnlyList<SocialAttachmentInput>? attachments = null,
            bool? preferAttachmentCover = null,
            CancellationToken cancellationToken = default)
        {
            Inquiry inquiry = await _context.Inquiries
                .IgnoreQueryFilters()
                .Include(item => item.Attachments)
                .SingleOrDefaultAsync(item => item.Id == inquiryId, cancellationToken)
                ?? throw new InvalidOperationException("La publicaciÃ³n no existe.");

            if (inquiry.UserId != userId)
                throw new InvalidOperationException("No tenÃ©s permisos para editar esta publicaciÃ³n.");

            inquiry.Title = RequireText(newTitle, 200, "El tÃ­tulo");
            inquiry.Content = RequireText(newContent, 10000, "El contenido");
            if (attachments is not null)
            {
                List<SocialAttachment> replacements = NormalizeAttachments(attachments, null, inquiry.Id, null);
                _context.SocialAttachments.RemoveRange(inquiry.Attachments);
                inquiry.Attachments = replacements;
                inquiry.FileUrl = replacements.FirstOrDefault()?.FileUrl;
            }

            if (preferAttachmentCover.HasValue)
                inquiry.PreferAttachmentCover = preferAttachmentCover.Value && inquiry.Attachments.Count > 0;

            inquiry.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return await LoadInquiryGraphAsync(inquiry.Id, cancellationToken);
        }

        public async Task<Inquiry> ToggleInquiryStatusAsync(
            Guid userId,
            Guid inquiryId,
            CancellationToken cancellationToken = default)
        {
            Inquiry inquiry = await _context.Inquiries
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(item => item.Id == inquiryId, cancellationToken)
                ?? throw new InvalidOperationException("La publicaciÃ³n no existe.");

            if (inquiry.UserId != userId)
                throw new InvalidOperationException("No tenÃ©s permisos para cambiar el estado de esta publicaciÃ³n.");

            inquiry.IsActive = !inquiry.IsActive;
            inquiry.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return inquiry;
        }

        public async Task<Comment> EditCommentAsync(
            Guid userId,
            Guid commentId,
            string newContent,
            IReadOnlyList<SocialAttachmentInput>? attachments = null,
            CancellationToken cancellationToken = default)
        {
            Comment comment = await _context.Comments
                .IgnoreQueryFilters()
                .Include(item => item.Attachments)
                .SingleOrDefaultAsync(item => item.Id == commentId, cancellationToken)
                ?? throw new InvalidOperationException("El comentario no existe.");

            if (comment.UserId != userId)
                throw new InvalidOperationException("No tenÃ©s permisos para editar este comentario.");

            comment.Content = RequireText(newContent, 1000, "El comentario");
            if (attachments is not null)
            {
                List<SocialAttachment> replacements = NormalizeAttachments(attachments, null, null, comment.Id);
                _context.SocialAttachments.RemoveRange(comment.Attachments);
                comment.Attachments = replacements;
                comment.FileUrl = replacements.FirstOrDefault()?.FileUrl;
            }

            comment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return await LoadCommentGraphAsync(comment.Id, cancellationToken);
        }

        public async Task<Comment> ToggleCommentStatusAsync(
            Guid userId,
            Guid commentId,
            CancellationToken cancellationToken = default)
        {
            Comment comment = await _context.Comments
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(item => item.Id == commentId, cancellationToken)
                ?? throw new InvalidOperationException("El comentario no existe.");

            if (comment.UserId != userId)
                throw new InvalidOperationException("No tenÃ©s permisos para cambiar el estado de este comentario.");

            comment.IsActive = !comment.IsActive;
            comment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return comment;
        }

        public async Task<Comment> AddCommentAsync(
            Guid userId,
            Guid inquiryId,
            string content,
            Guid? parentCommentId,
            string? fileUrl = null,
            IReadOnlyList<SocialAttachmentInput>? attachments = null,
            Guid? replyTargetCommentId = null,
            CancellationToken cancellationToken = default)
        {
            await EnsureUserCanCreateContentAsync(userId, "comentar", cancellationToken);
            string normalizedContent = RequireText(content, 1000, "El comentario");

            Guid? inquiryOwnerId = await _context.Inquiries
                .AsNoTracking()
                .Where(inquiry => inquiry.Id == inquiryId)
                .Select(inquiry => (Guid?)inquiry.UserId)
                .SingleOrDefaultAsync(cancellationToken);
            if (!inquiryOwnerId.HasValue)
                throw new InvalidOperationException("La publicación no existe.");

            if (!await _context.Users.AnyAsync(user => user.Id == userId && user.IsActive, cancellationToken))
                throw new InvalidOperationException("El usuario autenticado no está disponible.");

            Guid? replyToUserId = null;
            if (replyTargetCommentId.HasValue)
            {
                var replyTarget = await _context.Comments
                    .AsNoTracking()
                    .Where(comment =>
                        comment.Id == replyTargetCommentId.Value &&
                        comment.InquiryId == inquiryId &&
                        comment.Inquiry.IsActive &&
                        !comment.Inquiry.IsHiddenByModerator)
                    .Select(comment => new
                    {
                        comment.Id,
                        comment.UserId,
                        comment.ParentCommentId
                    })
                    .SingleOrDefaultAsync(cancellationToken)
                    ?? throw new InvalidOperationException("El comentario al que intentas responder no existe o no esta disponible.");

                Guid canonicalParentId = replyTarget.ParentCommentId ?? replyTarget.Id;
                if (parentCommentId.HasValue && parentCommentId.Value != canonicalParentId)
                    throw new InvalidOperationException("La respuesta dirigida no coincide con el hilo seleccionado.");

                parentCommentId = canonicalParentId;
                replyToUserId = replyTarget.UserId;
            }

            if (parentCommentId.HasValue)
            {
                var parent = await _context.Comments
                    .Where(comment => comment.Id == parentCommentId.Value)
                    .Select(comment => new { comment.InquiryId, comment.ParentCommentId, comment.UserId })
                    .SingleOrDefaultAsync(cancellationToken);

                if (parent is null)
                    throw new InvalidOperationException("El comentario al que intentas responder no existe.");

                if (parent.InquiryId != inquiryId)
                    throw new InvalidOperationException("La respuesta debe pertenecer a la misma publicación.");
                if (parent.ParentCommentId.HasValue)
                    throw new InvalidOperationException("Los comentarios permiten un maximo de dos niveles.");

                replyToUserId ??= parent.UserId;
            }

            Guid commentId = Guid.NewGuid();
            List<SocialAttachment> normalizedAttachments = NormalizeAttachments(
                attachments,
                fileUrl,
                null,
                commentId);

            var comment = new Comment
            {
                Id = commentId,
                InquiryId = inquiryId,
                UserId = userId,
                ParentCommentId = parentCommentId,
                ReplyToUserId = replyToUserId,
                Content = normalizedContent,
                FileUrl = normalizedAttachments.FirstOrDefault()?.FileUrl,
                CreatedAt = DateTime.UtcNow,
                Attachments = normalizedAttachments
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync(cancellationToken);

            string commentActionUrl = $"/feed?inquiryId={inquiryId:D}&commentId={comment.Id:D}";

            if (replyToUserId.HasValue && replyToUserId.Value != userId)
            {
                await TryNotifyGroupedAsync(
                    replyToUserId.Value,
                    NotificationType.SocialComment,
                    inquiryId,
                    $"social-mention:inquiry:{inquiryId:D}:user:{replyToUserId.Value:D}",
                    "Te mencionaron en una conversación.",
                    "Te mencionaron {count} veces en una conversación.",
                    commentActionUrl,
                    cancellationToken);
            }

            if (inquiryOwnerId.Value != userId && inquiryOwnerId.Value != replyToUserId)
            {
                await TryNotifyGroupedAsync(
                    inquiryOwnerId.Value,
                    NotificationType.SocialComment,
                    inquiryId,
                    $"social-comment:inquiry:{inquiryId:D}",
                    "Tu publicación recibió un comentario.",
                    "Tu publicación recibió {count} comentarios.",
                    commentActionUrl,
                    cancellationToken);
            }

            return await LoadCommentGraphAsync(comment.Id, cancellationToken);
        }

        public async Task<ToggleReactionPayload> ToggleReactionAsync(Guid userId, Guid inquiryId)
        {
            Guid? inquiryOwnerId = await _context.Inquiries
                .AsNoTracking()
                .Where(inquiry => inquiry.Id == inquiryId)
                .Select(inquiry => (Guid?)inquiry.UserId)
                .SingleOrDefaultAsync();
            if (!inquiryOwnerId.HasValue)
                throw new InvalidOperationException("La publicación no existe.");

            if (!await _context.Users.AnyAsync(user => user.Id == userId && user.IsActive))
                throw new InvalidOperationException("El usuario autenticado no está disponible.");

            var existingReaction = await _context.Reactions
                .SingleOrDefaultAsync(reaction => reaction.InquiryId == inquiryId && reaction.UserId == userId);

            bool isReacted;
            Guid? reactionId;
            if (existingReaction is null)
            {
                var reaction = new Reaction
                {
                    Id = Guid.NewGuid(),
                    InquiryId = inquiryId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Reactions.Add(reaction);
                isReacted = true;
                reactionId = reaction.Id;
            }
            else
            {
                _context.Reactions.Remove(existingReaction);
                isReacted = false;
                reactionId = existingReaction.Id;
            }

            await _context.SaveChangesAsync();

            if (isReacted && inquiryOwnerId.Value != userId)
            {
                await TryNotifyGroupedAsync(
                    inquiryOwnerId.Value,
                    NotificationType.SocialReaction,
                    inquiryId,
                    $"social-reaction:inquiry:{inquiryId:D}",
                    "Tu publicación recibió un Me gusta.",
                    "Tu publicación recibió {count} Me gusta.");
            }

            int reactionCount = await _context.Reactions.CountAsync(reaction => reaction.InquiryId == inquiryId);
            return new ToggleReactionPayload(inquiryId, isReacted, reactionCount, reactionId);
        }

        public async Task<ToggleCommentReactionPayload> ToggleCommentReactionAsync(Guid userId, Guid commentId)
        {
            await EnsureUserCanCreateContentAsync(userId, "reaccionar");

            var target = await _context.Comments
                .AsNoTracking()
                .Where(comment => comment.Id == commentId)
                .Select(comment => new { comment.UserId, comment.InquiryId })
                .SingleOrDefaultAsync()
                ?? throw new InvalidOperationException("El comentario no existe.");

            CommentReaction? existingReaction = await _context.CommentReactions
                .SingleOrDefaultAsync(reaction => reaction.CommentId == commentId && reaction.UserId == userId);

            bool isReacted;
            Guid? reactionId;
            if (existingReaction is null)
            {
                var reaction = new CommentReaction
                {
                    Id = Guid.NewGuid(),
                    CommentId = commentId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CommentReactions.Add(reaction);
                isReacted = true;
                reactionId = reaction.Id;
            }
            else
            {
                _context.CommentReactions.Remove(existingReaction);
                isReacted = false;
                reactionId = existingReaction.Id;
            }

            await _context.SaveChangesAsync();

            if (isReacted && target.UserId != userId)
            {
                await TryNotifyGroupedAsync(
                    target.UserId,
                    NotificationType.SocialReaction,
                    target.InquiryId,
                    $"social-reaction:comment:{commentId:D}",
                    "Tu comentario recibió un Me gusta.",
                    "Tu comentario recibió {count} Me gusta.",
                    $"/feed?inquiryId={target.InquiryId:D}&commentId={commentId:D}");
            }

            int reactionCount = await _context.CommentReactions
                .CountAsync(reaction => reaction.CommentId == commentId);
            return new ToggleCommentReactionPayload(commentId, isReacted, reactionCount, reactionId);
        }

        public async Task<ReactionUserPage> GetInquiryReactionUsersPageAsync(
            Guid userId,
            bool canModerate,
            Guid inquiryId,
            int first,
            string? after)
        {
            Guid? ownerId = await _context.Inquiries
                .AsNoTracking()
                .Where(inquiry => inquiry.Id == inquiryId)
                .Select(inquiry => (Guid?)inquiry.UserId)
                .SingleOrDefaultAsync();
            if (!ownerId.HasValue)
                throw new InvalidOperationException("La publicación no existe.");
            if (ownerId.Value != userId && !canModerate)
                throw new InvalidOperationException("No tenes permisos para ver las reacciones de esta publicación.");

            int pageSize = Math.Clamp(first, 1, 50);
            int offset = DecodeOffset(after);
            IQueryable<Reaction> reactions = _context.Reactions
                .AsNoTracking()
                .Where(reaction => reaction.InquiryId == inquiryId)
                .OrderByDescending(reaction => reaction.CreatedAt)
                .ThenByDescending(reaction => reaction.Id);

            int totalCount = await reactions.CountAsync();
            List<User> users = await reactions
                .Skip(offset)
                .Take(pageSize + 1)
                .Select(reaction => reaction.User)
                .ToListAsync();

            bool hasNextPage = users.Count > pageSize;
            if (hasNextPage)
                users.RemoveAt(users.Count - 1);

            return new ReactionUserPage
            {
                Items = users,
                HasNextPage = hasNextPage,
                NextCursor = hasNextPage ? EncodeOffset(offset + users.Count) : string.Empty,
                TotalCount = totalCount
            };
        }

        private async Task TryNotifyGroupedAsync(
            Guid recipientId,
            NotificationType type,
            Guid inquiryId,
            string groupKey,
            string singularMessage,
            string pluralMessageTemplate,
            string? actionUrl = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                await _notificationService.UpsertGroupedNotificationAsync(
                    recipientId,
                    type,
                    inquiryId,
                    groupKey,
                    singularMessage,
                    pluralMessageTemplate,
                    cancellationToken,
                    actionUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Social action persisted but grouped notification failed for inquiry {InquiryId} and user {UserId}.",
                    inquiryId,
                    recipientId);
            }
        }

        private async Task EnsureUserCanCreateContentAsync(
            Guid userId,
            string action,
            CancellationToken cancellationToken = default)
        {
            var userModerationState = await _context.Users
                .Where(user => user.Id == userId && user.IsActive)
                .Select(user => new { user.MutedUntil })
                .SingleOrDefaultAsync(cancellationToken);

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

        private async Task<Inquiry> LoadInquiryGraphAsync(
            Guid inquiryId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Inquiries
                .AsNoTracking()
                .AsSplitQuery()
                .Include(inquiry => inquiry.User)
                .ThenInclude(user => user.Account)
                .Include(inquiry => inquiry.Subject)
                .ThenInclude(subject => subject.Career)
                .Include(inquiry => inquiry.Attachments)
                .Include(inquiry => inquiry.Reactions)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.User)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.ReplyToUser)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.Attachments)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.Reactions)
                .Include(inquiry => inquiry.Comments)
                .ThenInclude(comment => comment.Replies)
                .ThenInclude(reply => reply.User)
                .SingleAsync(inquiry => inquiry.Id == inquiryId, cancellationToken);
        }

        private async Task<Comment> LoadCommentGraphAsync(
            Guid commentId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Comments
                .AsNoTracking()
                .Include(comment => comment.User)
                .Include(comment => comment.ReplyToUser)
                .Include(comment => comment.Inquiry)
                .Include(comment => comment.Attachments)
                .Include(comment => comment.Reactions)
                .SingleAsync(comment => comment.Id == commentId, cancellationToken);
        }
    }
}
