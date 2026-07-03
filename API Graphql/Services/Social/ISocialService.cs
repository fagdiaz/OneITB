using System;
using System.Linq;
using System.Threading.Tasks;
using OneItb.Entities.Models;
using Services.Social;

namespace OneITB.Core.Services.Interfaces
{
    public interface ISocialService
    {
        IQueryable<Inquiry> GetInquiries(Guid? currentUserId, string? searchTerm, int? careerId, int[]? careerIds, int[]? subjectIds);
        Task<InquiryPage> GetInquiriesPageAsync(Guid? currentUserId, string? searchTerm, int? careerId, int[]? careerIds, int[]? subjectIds, int first, string? after);
        Task<Inquiry> AddInquiryAsync(Guid userId, int subjectId, string title, string content, string? fileUrl = null);
        Task<Comment> AddCommentAsync(Guid userId, Guid inquiryId, string content, Guid? parentCommentId, string? fileUrl = null);
        Task<ToggleReactionPayload> ToggleReactionAsync(Guid userId, Guid inquiryId);
        Task<Inquiry> EditInquiryAsync(Guid userId, bool canModerate, Guid inquiryId, string newTitle, string newContent);
        Task<Inquiry> ToggleInquiryStatusAsync(Guid userId, bool canModerate, Guid inquiryId);
        Task<Comment> EditCommentAsync(Guid userId, bool canModerate, Guid commentId, string newContent);
        Task<Comment> ToggleCommentStatusAsync(Guid userId, bool canModerate, Guid commentId);
    }

    public record ToggleReactionPayload(Guid InquiryId, bool IsReacted, int ReactionCount);
}
