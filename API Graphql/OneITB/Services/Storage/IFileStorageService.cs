using Microsoft.AspNetCore.Http;

namespace OneItb.GraphQL.Services.Storage
{
    public interface IFileStorageService
    {
        Task<string> SaveAsync(IFormFile file, string extension, CancellationToken cancellationToken = default);
    }
}
