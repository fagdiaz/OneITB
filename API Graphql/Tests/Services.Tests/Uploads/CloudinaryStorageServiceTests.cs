using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using OneItb.GraphQL.Services.Storage;
using Xunit;

namespace Services.Tests.Uploads;

public sealed class CloudinaryStorageServiceTests
{
    [Fact]
    public async Task SaveAsync_ReturnsSecureUrl_FromSuccessfulProviderResponse()
    {
        using var httpClient = new HttpClient(new StubHandler((_, _) => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("{\"secure_url\":\"https://res.cloudinary.com/demo/image/upload/avatar.jpg\"}")
            })));
        CloudinaryStorageService service = CreateService(httpClient);

        string result = await service.SaveAsync(CreateImage(), ".jpg", CancellationToken.None);

        Assert.Equal(
            "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
            result);
    }

    [Fact]
    public async Task SaveAsync_MapsProviderTimeout_ToControlledUnavailableFailure()
    {
        using var httpClient = new HttpClient(new StubHandler((_, _) =>
            throw new TaskCanceledException("simulated timeout")));
        CloudinaryStorageService service = CreateService(httpClient);

        FileStorageUnavailableException exception = await Assert.ThrowsAsync<FileStorageUnavailableException>(
            () => service.SaveAsync(CreateImage(), ".jpg", CancellationToken.None));

        Assert.Contains("timeout", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("secret", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SaveAsync_PreservesCallerCancellation()
    {
        using var httpClient = new HttpClient(new StubHandler((_, token) =>
            Task.FromCanceled<HttpResponseMessage>(token)));
        CloudinaryStorageService service = CreateService(httpClient);
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(
            () => service.SaveAsync(CreateImage(), ".jpg", cancellation.Token));
    }

    [Fact]
    public async Task SaveAsync_DoesNotExposeCredentials_WhenProviderRejectsUpload()
    {
        using var httpClient = new HttpClient(new StubHandler((_, _) => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.Unauthorized)
            {
                Content = new StringContent("provider detail")
            })));
        CloudinaryStorageService service = CreateService(httpClient);

        FileStorageUnavailableException exception = await Assert.ThrowsAsync<FileStorageUnavailableException>(
            () => service.SaveAsync(CreateImage(), ".jpg", CancellationToken.None));

        Assert.DoesNotContain("api-secret", exception.ToString(), StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("api-key", exception.ToString(), StringComparison.OrdinalIgnoreCase);
    }

    private static CloudinaryStorageService CreateService(HttpClient httpClient)
    {
        return new CloudinaryStorageService(
            httpClient,
            Options.Create(new CloudinarySettings
            {
                Url = "cloudinary://api-key:api-secret@demo",
                Folder = "oneitb23-tests"
            }),
            Options.Create(new FileStorageOptions
            {
                Provider = FileStorageRuntimeInfo.CloudinaryMode,
                CloudinaryTimeoutSeconds = 5
            }),
            Mock.Of<ILogger<CloudinaryStorageService>>());
    }

    private static IFormFile CreateImage()
    {
        byte[] content = "image-content"u8.ToArray();
        return new FormFile(
            new MemoryStream(content, writable: false),
            0,
            content.Length,
            "file",
            "avatar.jpg")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/jpeg"
        };
    }

    private sealed class StubHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> _handler;

        public StubHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handler)
        {
            _handler = handler;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            return _handler(request, cancellationToken);
        }
    }
}
