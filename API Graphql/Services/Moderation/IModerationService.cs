using System;
using System.Linq;
using System.Threading.Tasks;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface IModerationService
    {
        IQueryable<CommunityReport> GetCommunityReports();
        Task<CommunityReport> ReportInquiryAsync(Guid reporterId, Guid inquiryId, string reason);
    }
}
