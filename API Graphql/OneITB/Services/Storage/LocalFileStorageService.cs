using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace OneItb.GraphQL.Services.Storage
{
    public sealed class LocalFileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _environment;

        public LocalFileStorageService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> SaveAsync(IFormFile file, string extension, CancellationToken cancellationToken = default)
        {
            string webRoot = _environment.WebRootPath
                ?? System.IO.Path.Combine(_environment.ContentRootPath, "wwwroot");
            string uploadsDirectory = System.IO.Path.Combine(webRoot, "uploads");
            Directory.CreateDirectory(uploadsDirectory);

            string storedFileName = $"{Guid.NewGuid():N}{extension}";
            string physicalPath = System.IO.Path.Combine(uploadsDirectory, storedFileName);

            await using FileStream stream = new(
                physicalPath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                bufferSize: 81920,
                useAsync: true);
            await file.CopyToAsync(stream, cancellationToken);

            return $"/uploads/{storedFileName}";
        }
    }
}
