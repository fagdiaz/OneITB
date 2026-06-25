using System;
using System.Threading;
using System.Threading.Tasks;

namespace Services.Uploads
{
    public interface IUploadCleanupService
    {
        Task<UploadCleanupResult> CleanupAsync(string uploadsDirectory, TimeSpan minimumAge, CancellationToken cancellationToken = default);
    }
}
