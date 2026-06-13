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

        public async Task<CommunityReport> ReportInquiryAsync(Guid reporterId, Guid inquiryId, string reason)
        {
            string normalizedReason = reason?.Trim() ?? string.Empty;
            if (normalizedReason.Length == 0)
                throw new ArgumentException("El motivo del reporte no puede estar vacío.");
            if (normalizedReason.Length > 500)
                throw new ArgumentException("El motivo del reporte no puede superar 500 caracteres.");

            if (!await _context.Inquiries.AnyAsync(inquiry => inquiry.Id == inquiryId))
                throw new InvalidOperationException("La publicación no existe.");

            if (!await _context.Users.AnyAsync(user => user.Id == reporterId && user.IsActive))
                throw new InvalidOperationException("El usuario autenticado no está disponible.");

            bool alreadyPending = await _context.CommunityReports.AnyAsync(report =>
                report.ReporterId == reporterId &&
                report.InquiryId == inquiryId &&
                report.Status == "Pending");

            if (alreadyPending)
                throw new InvalidOperationException("Ya enviaste un reporte pendiente para esta publicación.");

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
    }
}
