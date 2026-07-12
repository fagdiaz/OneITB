using System;
using System.Linq;
using System.Threading.Tasks;
using OneItb.Entities.Models;
using Services.Social;

namespace OneITB.Core.Services.Interfaces
{
    public interface ISocialService
    {
        IQueryable<Inquiry> GetInquiries(Guid? currentUserId, string? searchTerm, int? careerId, int[]? careerIds, int[]? subjectIds, Guid? inquiryId = null);
        Task<InquiryPage> GetInquiriesPageAsync(Guid? currentUserId, string? searchTerm, int? careerId, int[]? careerIds, int[]? subjectIds, int first, string? after, Guid? inquiryId = null);
        Task<Inquiry> AddInquiryAsync(Guid userId, int subjectId, string title, string content, string? fileUrl = null, IReadOnlyList<SocialAttachmentInput>? attachments = null);
        Task<Comment> AddCommentAsync(Guid userId, Guid inquiryId, string content, Guid? parentCommentId, string? fileUrl = null, IReadOnlyList<SocialAttachmentInput>? attachments = null);
        Task<ToggleReactionPayload> ToggleReactionAsync(Guid userId, Guid inquiryId);
        Task<ToggleCommentReactionPayload> ToggleCommentReactionAsync(Guid userId, Guid commentId);
        Task<ReactionUserPage> GetInquiryReactionUsersPageAsync(Guid userId, bool canModerate, Guid inquiryId, int first, string? after);
        Task<Inquiry> EditInquiryAsync(Guid userId, bool canModerate, Guid inquiryId, string newTitle, string newContent);
        Task<Inquiry> ToggleInquiryStatusAsync(Guid userId, bool canModerate, Guid inquiryId);
        Task<Comment> EditCommentAsync(Guid userId, bool canModerate, Guid commentId, string newContent);
        Task<Comment> ToggleCommentStatusAsync(Guid userId, bool canModerate, Guid commentId);
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
