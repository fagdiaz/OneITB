using System;
using System.Threading.Tasks;
using OneItb.Entities.Models;
using Services.Social;

namespace OneITB.Core.Services.Interfaces
{
    public interface ISocialService
    {
        Task<InquiryPage> GetInquiriesPageAsync(
            Guid? currentUserId,
            string? searchTerm,
            int? careerId,
            int[]? careerIds,
            int[]? subjectIds,
            int first,
            string? after,
            Guid? inquiryId = null,
            Guid? authorId = null,
            CancellationToken cancellationToken = default);
        Task<Inquiry> AddInquiryAsync(Guid userId, int subjectId, string title, string content, string? fileUrl = null, IReadOnlyList<SocialAttachmentInput>? attachments = null, bool preferAttachmentCover = false, CancellationToken cancellationToken = default);
        Task<Comment> AddCommentAsync(Guid userId, Guid inquiryId, string content, Guid? parentCommentId, string? fileUrl = null, IReadOnlyList<SocialAttachmentInput>? attachments = null, Guid? replyTargetCommentId = null, CancellationToken cancellationToken = default);
        Task<ToggleReactionPayload> ToggleReactionAsync(Guid userId, Guid inquiryId, CancellationToken cancellationToken = default);
        Task<ToggleCommentReactionPayload> ToggleCommentReactionAsync(Guid userId, Guid commentId, CancellationToken cancellationToken = default);
        Task<ReactionUserPage> GetInquiryReactionUsersPageAsync(Guid userId, bool canModerate, Guid inquiryId, int first, string? after, CancellationToken cancellationToken = default);
        Task<Inquiry> EditInquiryAsync(Guid userId, Guid inquiryId, string newTitle, string newContent, IReadOnlyList<SocialAttachmentInput>? attachments = null, bool? preferAttachmentCover = null, CancellationToken cancellationToken = default);
        Task<Inquiry> ToggleInquiryStatusAsync(Guid userId, Guid inquiryId, CancellationToken cancellationToken = default);
        Task<Comment> EditCommentAsync(Guid userId, Guid commentId, string newContent, IReadOnlyList<SocialAttachmentInput>? attachments = null, CancellationToken cancellationToken = default);
        Task<Comment> ToggleCommentStatusAsync(Guid userId, Guid commentId, CancellationToken cancellationToken = default);
    }

    public sealed record SocialAttachmentInput(
        string FileUrl,
        string OriginalFileName,
        string ContentType,
        long Size,
        int SortOrder);

    public record ToggleReactionPayload(Guid InquiryId, bool IsReacted, int ReactionCount, Guid? ReactionId = null);
    public record ToggleCommentReactionPayload(Guid CommentId, bool IsReacted, int ReactionCount, Guid? ReactionId = null);
}
