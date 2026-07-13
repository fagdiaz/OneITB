using System;
using System.Linq;
using System.Threading.Tasks;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface IModerationService
    {
        IQueryable<CommunityReport> GetCommunityReports();
        IQueryable<ModerationAudit> GetModerationAudits(int first);
        Task<CommunityReport> ReportInquiryAsync(Guid reporterId, Guid inquiryId, string reason);
        Task RecordAuditAsync(
            Guid actorUserId,
            string action,
            string summary,
            Guid? targetUserId = null,
            Guid? targetInquiryId = null,
            Guid? targetCommentId = null,
            Guid? targetReportId = null);
        Task<Inquiry> ModerateInquiryVisibilityAsync(Guid actorUserId, Guid inquiryId, bool isHidden, string reason, CancellationToken cancellationToken = default);
        Task<Comment> ModerateCommentVisibilityAsync(Guid actorUserId, Guid commentId, bool isHidden, string reason, CancellationToken cancellationToken = default);
    }
}
