using System;
using System.Linq;
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

        public IQueryable<CommunityReport> GetCommunityReports()
        {
            return _context.CommunityReports
                .AsNoTracking()
                .OrderByDescending(report => report.CreatedAt);
        }

        public IQueryable<ModerationAudit> GetModerationAudits(int first)
        {
            int limit = Math.Clamp(first, 1, 100);
            return _context.ModerationAudits
                .AsNoTracking()
                .Include(audit => audit.ActorUser)
                .Include(audit => audit.TargetUser)
                .Include(audit => audit.TargetInquiry)
                .Include(audit => audit.TargetComment)
                .Include(audit => audit.TargetReport)
                .OrderByDescending(audit => audit.CreatedAt)
                .ThenByDescending(audit => audit.Id)
                .Take(limit);
        }

        public async Task<CommunityReport> ReportInquiryAsync(Guid reporterId, Guid inquiryId, string reason)
        {
            string normalizedReason = reason?.Trim() ?? string.Empty;
            if (normalizedReason.Length == 0)
                throw new ArgumentException("El motivo del reporte no puede estar vacÃ­o.");
            if (normalizedReason.Length > 500)
                throw new ArgumentException("El motivo del reporte no puede superar 500 caracteres.");

            if (!await _context.Inquiries.AnyAsync(inquiry => inquiry.Id == inquiryId))
                throw new InvalidOperationException("La publicaciÃ³n no existe.");

            if (!await _context.Users.AnyAsync(user => user.Id == reporterId && user.IsActive))
                throw new InvalidOperationException("El usuario autenticado no estÃ¡ disponible.");

            bool alreadyPending = await _context.CommunityReports.AnyAsync(report =>
                report.ReporterId == reporterId &&
                report.InquiryId == inquiryId &&
                report.Status == "Pending");

            if (alreadyPending)
                throw new InvalidOperationException("Ya enviaste un reporte pendiente para esta publicaciÃ³n.");

            var report = new CommunityReport
            {
                ReporterId = reporterId,
                InquiryId = inquiryId,
                Reason = normalizedReason
            };

            _context.CommunityReports.Add(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task RecordAuditAsync(
            Guid actorUserId,
            string action,
            string summary,
            Guid? targetUserId = null,
            Guid? targetInquiryId = null,
            Guid? targetCommentId = null,
            Guid? targetReportId = null)
        {
            string normalizedAction = action?.Trim() ?? string.Empty;
            string normalizedSummary = summary?.Trim() ?? string.Empty;
            if (normalizedAction.Length == 0 || normalizedAction.Length > 80)
                throw new ArgumentException("La accion de auditoria es invalida.");
            if (normalizedSummary.Length == 0 || normalizedSummary.Length > 500)
                throw new ArgumentException("El resumen de auditoria es invalido.");
            if (!targetUserId.HasValue && !targetInquiryId.HasValue && !targetCommentId.HasValue && !targetReportId.HasValue)
                throw new ArgumentException("La auditoria debe tener un objetivo.");

            _context.ModerationAudits.Add(new ModerationAudit
            {
                ActorUserId = actorUserId,
                Action = normalizedAction,
                Summary = normalizedSummary,
                TargetUserId = targetUserId,
                TargetInquiryId = targetInquiryId,
                TargetCommentId = targetCommentId,
                TargetReportId = targetReportId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }
    }
}
