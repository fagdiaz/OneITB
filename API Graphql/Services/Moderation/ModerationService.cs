using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Moderation
{
    public class ModerationService : IModerationService
    {
        private readonly OneItbContext _context;

        public ModerationService(OneItbContext context)
        {
            _context = context;
        }

        public async Task<bool> ReportContentAsync(Guid reporterId, string contentId, string contentType, string reason)
        {
            var report = new CommunityReport
            {
                ReporterId = reporterId,
                ContentId = contentId,
                ContentType = contentType,
                Reason = reason
            };

            _context.CommunityReports.Add(report);
            await _context.SaveChangesAsync();

            // Threshold logic (simulate hiding the post if report count >= 5)
            var reportCount = await _context.CommunityReports.CountAsync(r => r.ContentId == contentId && r.Status == "Pending");
            if (reportCount >= 5)
            {
                // TODO: Integrate ILogger<ModerationService> and emit a structured warning.
                // At >= 5 pending reports, the post should be flagged for review.
            }

            return true;
        }
    }
}
