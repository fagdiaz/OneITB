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
                .IgnoreQueryFilters()
                .AsNoTracking()
                .OrderByDescending(report => report.CreatedAt);
        }

        public async Task<Inquiry> ModerateInquiryVisibilityAsync(
            Guid actorUserId,
            Guid inquiryId,
            bool isHidden,
            string reason,
            CancellationToken cancellationToken = default)
        {
            await EnsureModeratorAsync(actorUserId, cancellationToken);
            string normalizedReason = NormalizeModerationReason(reason);

            Inquiry inquiry = await _context.Inquiries
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(item => item.Id == inquiryId, cancellationToken)
                ?? throw new InvalidOperationException("La publicacion no existe.");

            if (inquiry.IsHiddenByModerator == isHidden)
                return inquiry;

            inquiry.IsHiddenByModerator = isHidden;
            inquiry.UpdatedAt = DateTime.UtcNow;
            _context.ModerationAudits.Add(new ModerationAudit
            {
                Id = Guid.NewGuid(),
                ActorUserId = actorUserId,
                TargetInquiryId = inquiry.Id,
                Action = isHidden ? "HideInquiry" : "RestoreInquiry",
                Summary = normalizedReason,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync(cancellationToken);
            return inquiry;
        }

        public async Task<Comment> ModerateCommentVisibilityAsync(
            Guid actorUserId,
            Guid commentId,
            bool isHidden,
            string reason,
            CancellationToken cancellationToken = default)
        {
            await EnsureModeratorAsync(actorUserId, cancellationToken);
            string normalizedReason = NormalizeModerationReason(reason);

            Comment comment = await _context.Comments
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(item => item.Id == commentId, cancellationToken)
                ?? throw new InvalidOperationException("El comentario no existe.");

            if (comment.IsHiddenByModerator == isHidden)
                return comment;

            comment.IsHiddenByModerator = isHidden;
            comment.UpdatedAt = DateTime.UtcNow;
            _context.ModerationAudits.Add(new ModerationAudit
            {
                Id = Guid.NewGuid(),
                ActorUserId = actorUserId,
                TargetInquiryId = comment.InquiryId,
                TargetCommentId = comment.Id,
                Action = isHidden ? "HideComment" : "RestoreComment",
                Summary = normalizedReason,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync(cancellationToken);
            return comment;
        }

        public IQueryable<ModerationAudit> GetModerationAudits(int first)
        {
            int limit = Math.Clamp(first, 1, 100);
            return _context.ModerationAudits
                .IgnoreQueryFilters()
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

        private async Task EnsureModeratorAsync(Guid actorUserId, CancellationToken cancellationToken)
        {
            string? role = await _context.Users
                .AsNoTracking()
                .Where(user => user.Id == actorUserId && user.IsActive)
                .Select(user => user.Role)
                .SingleOrDefaultAsync(cancellationToken);

            if (role is not ("Administrador" or "Moderador"))
                throw new InvalidOperationException("No tenes permisos para moderar contenido.");
        }

        private static string NormalizeModerationReason(string reason)
        {
            string normalized = reason?.Trim() ?? string.Empty;
            if (normalized.Length < 5)
                throw new ArgumentException("El motivo de moderacion debe tener al menos 5 caracteres.");
            if (normalized.Length > 500)
                throw new ArgumentException("El motivo de moderacion no puede superar 500 caracteres.");
            return normalized;
        }
    }
}
