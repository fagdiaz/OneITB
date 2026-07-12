using Microsoft.EntityFrameworkCore;
using OneItb.Data;

namespace Services.Uploads
{
    public sealed class UploadCleanupService : IUploadCleanupService
    {
        private readonly OneItbContext _context;

        public UploadCleanupService(OneItbContext context)
        {
            _context = context;
        }

        public async Task<UploadCleanupResult> CleanupAsync(
            string uploadsDirectory,
            TimeSpan minimumAge,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(uploadsDirectory) || !Directory.Exists(uploadsDirectory))
                return new UploadCleanupResult(0, 0, 0, 0);

            HashSet<string> referencedUrls = await LoadReferencedUploadUrlsAsync(cancellationToken);
            DateTime cutoff = DateTime.UtcNow.Subtract(minimumAge);

            int scanned = 0;
            int deleted = 0;
            int preserved = 0;
            int failed = 0;

            foreach (string filePath in Directory.EnumerateFiles(uploadsDirectory))
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (Path.GetFileName(filePath).StartsWith(".", StringComparison.Ordinal))
                    continue;

                scanned++;

                string relativeUrl = "/uploads/" + Path.GetFileName(filePath).Replace('\\', '/');
                if (referencedUrls.Contains(relativeUrl) || File.GetLastWriteTimeUtc(filePath) > cutoff)
                {
                    preserved++;
                    continue;
                }

                try
                {
                    File.Delete(filePath);
                    deleted++;
                }
                catch (IOException)
                {
                    failed++;
                }
                catch (UnauthorizedAccessException)
                {
                    failed++;
                }
            }

            return new UploadCleanupResult(scanned, deleted, preserved, failed);
        }

        private async Task<HashSet<string>> LoadReferencedUploadUrlsAsync(CancellationToken cancellationToken)
        {
            List<string> inquiryUrls = await _context.Inquiries
                .IgnoreQueryFilters()
                .Where(inquiry => inquiry.FileUrl != null && inquiry.FileUrl.StartsWith("/uploads/"))
                .Select(inquiry => inquiry.FileUrl!)
                .ToListAsync(cancellationToken);

            List<string> commentUrls = await _context.Comments
                .IgnoreQueryFilters()
                .Where(comment => comment.FileUrl != null && comment.FileUrl.StartsWith("/uploads/"))
                .Select(comment => comment.FileUrl!)
                .ToListAsync(cancellationToken);

            List<string> attachmentUrls = await _context.SocialAttachments
                .AsNoTracking()
                .Where(attachment => attachment.FileUrl.StartsWith("/uploads/"))
                .Select(attachment => attachment.FileUrl)
                .ToListAsync(cancellationToken);

            return inquiryUrls
                .Concat(commentUrls)
                .Concat(attachmentUrls)
                .ToHashSet(StringComparer.Ordinal);
        }
    }
}
