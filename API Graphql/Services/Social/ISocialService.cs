using System;
using System.Linq;
using System.Threading.Tasks;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface ISocialService
    {
        IQueryable<Inquiry> GetInquiries();
        Task<Inquiry> AddInquiryAsync(Guid userId, int subjectId, string title, string content);
        Task<Comment> AddCommentAsync(Guid userId, Guid inquiryId, string content, Guid? parentCommentId);
        Task<ToggleReactionPayload> ToggleReactionAsync(Guid userId, Guid inquiryId);
    }

    public record ToggleReactionPayload(Guid InquiryId, bool IsReacted, int ReactionCount);
}

