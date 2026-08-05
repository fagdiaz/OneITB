using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace OneItb.GraphQL.Services.Storage
{
    public sealed class LocalFileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<LocalFileStorageService> _logger;

        public LocalFileStorageService(
            IWebHostEnvironment environment,
            ILogger<LocalFileStorageService> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<string> SaveAsync(IFormFile file, string extension, CancellationToken cancellationToken = default)
        {
            string webRoot = _environment.WebRootPath
                ?? System.IO.Path.Combine(_environment.ContentRootPath, "wwwroot");
            string uploadsDirectory = System.IO.Path.Combine(webRoot, "uploads");
            Directory.CreateDirectory(uploadsDirectory);

            string storedFileName = $"{Guid.NewGuid():N}{extension}";
            string physicalPath = System.IO.Path.Combine(uploadsDirectory, storedFileName);

            try
            {
                await using FileStream stream = new(
                    physicalPath,
                    FileMode.CreateNew,
                    FileAccess.Write,
                    FileShare.None,
                    bufferSize: 81920,
                    useAsync: true);
                await file.CopyToAsync(stream, cancellationToken);
            }
            catch (Exception exception)
            {
                if (File.Exists(physicalPath))
                {
                    try
                    {
                        File.Delete(physicalPath);
                    }
                    catch (Exception cleanupException) when (
                        cleanupException is IOException or UnauthorizedAccessException)
                    {
                        _logger.LogWarning(
                            cleanupException,
                            "Could not remove a partial local upload after {FailureType}",
                            exception.GetType().Name);
                    }
                }

                throw;
            }

            return $"/uploads/{storedFileName}";
        }
    }
}
