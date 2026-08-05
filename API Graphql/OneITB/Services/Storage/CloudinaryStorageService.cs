using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace OneItb.GraphQL.Services.Storage
{
    public sealed class CloudinaryStorageService : IFileStorageService
    {
        private readonly HttpClient _httpClient;
        private readonly CloudinarySettings _settings;
        private readonly FileStorageOptions _fileStorageOptions;
        private readonly ILogger<CloudinaryStorageService> _logger;

        public CloudinaryStorageService(
            HttpClient httpClient,
            IOptions<CloudinarySettings> settings,
            IOptions<FileStorageOptions> fileStorageOptions,
            ILogger<CloudinaryStorageService> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _fileStorageOptions = fileStorageOptions.Value;
            _logger = logger;
        }

        public async Task<string> SaveAsync(IFormFile file, string extension, CancellationToken cancellationToken = default)
        {
            CloudinaryCredentials credentials = ParseCredentials(_settings.Url);
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            string publicId = $"{NormalizeFolder(_settings.Folder)}/{Guid.NewGuid():N}";
            string signature = Sign(
                $"public_id={publicId}&timestamp={timestamp}",
                credentials.ApiSecret);

            using MultipartFormDataContent form = new();
            await using Stream fileStream = file.OpenReadStream();
            using StreamContent streamContent = new(fileStream);
            if (!string.IsNullOrWhiteSpace(file.ContentType))
            {
                streamContent.Headers.ContentType = MediaTypeHeaderValue.Parse(file.ContentType);
            }

            form.Add(streamContent, "file", string.IsNullOrWhiteSpace(file.FileName) ? $"upload{extension}" : file.FileName);
            form.Add(new StringContent(credentials.ApiKey), "api_key");
            form.Add(new StringContent(timestamp.ToString()), "timestamp");
            form.Add(new StringContent(publicId), "public_id");
            form.Add(new StringContent(signature), "signature");

            string endpoint = $"https://api.cloudinary.com/v1_1/{credentials.CloudName}/auto/upload";
            using CancellationTokenSource timeoutSource = CancellationTokenSource
                .CreateLinkedTokenSource(cancellationToken);
            timeoutSource.CancelAfter(TimeSpan.FromSeconds(
                _fileStorageOptions.CloudinaryTimeoutSeconds));

            HttpResponseMessage response;
            try
            {
                response = await _httpClient.PostAsync(endpoint, form, timeoutSource.Token);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (OperationCanceledException exception)
            {
                _logger.LogWarning(
                    "Cloudinary upload timed out after {TimeoutSeconds} seconds",
                    _fileStorageOptions.CloudinaryTimeoutSeconds);
                throw new FileStorageUnavailableException(
                    "Cloudinary did not respond within the configured timeout.",
                    exception);
            }
            catch (HttpRequestException exception)
            {
                _logger.LogWarning(
                    exception,
                    "Cloudinary upload transport failed");
                throw new FileStorageUnavailableException(
                    "Cloudinary transport is unavailable.",
                    exception);
            }

            using (response)
            {
                string payload = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "Cloudinary upload failed with status {StatusCode}",
                        (int)response.StatusCode);
                    throw new FileStorageUnavailableException(
                        "Cloudinary rejected the upload request.");
                }

                try
                {
                    using JsonDocument document = JsonDocument.Parse(payload);
                    if (!document.RootElement.TryGetProperty("secure_url", out JsonElement secureUrlElement))
                    {
                        throw new FileStorageUnavailableException(
                            "Cloudinary returned an incomplete response.");
                    }

                    string? secureUrl = secureUrlElement.GetString();
                    if (string.IsNullOrWhiteSpace(secureUrl) ||
                        !Uri.TryCreate(secureUrl, UriKind.Absolute, out Uri? parsed) ||
                        parsed.Scheme != Uri.UriSchemeHttps)
                    {
                        throw new FileStorageUnavailableException(
                            "Cloudinary returned an invalid secure URL.");
                    }

                    return secureUrl;
                }
                catch (JsonException exception)
                {
                    throw new FileStorageUnavailableException(
                        "Cloudinary returned an invalid response.",
                        exception);
                }
            }
        }

        private static CloudinaryCredentials ParseCredentials(string? url)
        {
            if (string.IsNullOrWhiteSpace(url) ||
                !Uri.TryCreate(url, UriKind.Absolute, out Uri? parsed) ||
                parsed.Scheme != "cloudinary" ||
                string.IsNullOrWhiteSpace(parsed.UserInfo) ||
                string.IsNullOrWhiteSpace(parsed.Host))
            {
                throw new InvalidOperationException("CloudinarySettings:Url debe usar el formato cloudinary://api_key:api_secret@cloud_name.");
            }

            string[] userInfo = parsed.UserInfo.Split(':', 2);
            if (userInfo.Length != 2)
            {
                throw new InvalidOperationException("CloudinarySettings:Url no contiene api_key y api_secret.");
            }

            return new CloudinaryCredentials(
                Uri.UnescapeDataString(userInfo[0]),
                Uri.UnescapeDataString(userInfo[1]),
                parsed.Host);
        }

        private static string NormalizeFolder(string folder)
        {
            string normalized = string.IsNullOrWhiteSpace(folder) ? "oneitb23" : folder.Trim().Trim('/');
            return normalized.Replace('\\', '/');
        }

        private static string Sign(string payload, string secret)
        {
            byte[] bytes = SHA1.HashData(Encoding.UTF8.GetBytes(payload + secret));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private sealed record CloudinaryCredentials(string ApiKey, string ApiSecret, string CloudName);
    }
}
