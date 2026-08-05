using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using OneItb.GraphQL.Services.Storage;
using Xunit;

namespace Services.Tests.Uploads;

public sealed class LocalFileStorageServiceTests
{
    [Fact]
    public async Task SaveAsync_PersistsAValidFile_UnderGeneratedUploadName()
    {
        string temporaryRoot = Path.Combine(
            Path.GetTempPath(),
            $"oneitb-storage-{Guid.NewGuid():N}");
        string webRoot = Path.Combine(temporaryRoot, "wwwroot");
        Directory.CreateDirectory(webRoot);

        try
        {
            var environment = new Mock<IWebHostEnvironment>();
            environment.SetupGet(item => item.ContentRootPath).Returns(temporaryRoot);
            environment.SetupGet(item => item.WebRootPath).Returns(webRoot);
            var service = new LocalFileStorageService(
                environment.Object,
                Mock.Of<ILogger<LocalFileStorageService>>());
            byte[] content = "local-avatar"u8.ToArray();
            IFormFile file = new FormFile(
                new MemoryStream(content, writable: false),
                0,
                content.Length,
                "file",
                "original-name.jpg")
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg"
            };

            string url = await service.SaveAsync(file, ".jpg", CancellationToken.None);

            Assert.StartsWith("/uploads/", url, StringComparison.Ordinal);
            Assert.EndsWith(".jpg", url, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain("original-name", url, StringComparison.OrdinalIgnoreCase);
            string storedPath = Path.Combine(
                webRoot,
                url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            Assert.True(File.Exists(storedPath));
            Assert.Equal(content, await File.ReadAllBytesAsync(storedPath));
        }
        finally
        {
            if (Directory.Exists(temporaryRoot))
            {
                Directory.Delete(temporaryRoot, recursive: true);
            }
        }
    }
}
