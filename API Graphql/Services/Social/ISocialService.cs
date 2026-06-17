using System;
using System.Linq;
using System.Threading.Tasks;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface ISocialService
    {
        IQueryable<Inquiry> GetInquiries(Guid? currentUserId, string? searchTerm, int? careerId, int[]? subjectIds);
        Task<Inquiry> AddInquiryAsync(Guid userId, int subjectId, string title, string content, string? attachedFileUrl = null);
        Task<Comment> AddCommentAsync(Guid userId, Guid inquiryId, string content, Guid? parentCommentId);
        Task<ToggleReactionPayload> ToggleReactionAsync(Guid userId, Guid inquiryId);
        Task<Inquiry> EditInquiryAsync(Guid userId, bool canModerate, Guid inquiryId, string newTitle, string newContent);
        Task<Inquiry> ToggleInquiryStatusAsync(Guid userId, bool canModerate, Guid inquiryId);
        Task<Comment> EditCommentAsync(Guid userId, bool canModerate, Guid commentId, string newContent);
        Task<Comment> ToggleCommentStatusAsync(Guid userId, bool canModerate, Guid commentId);
    }

    public record ToggleReactionPayload(Guid InquiryId, bool IsReacted, int ReactionCount);
}
