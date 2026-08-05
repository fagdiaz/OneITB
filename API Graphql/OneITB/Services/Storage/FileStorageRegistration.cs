using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace OneItb.GraphQL.Services.Storage
{
    public sealed record FileStorageRuntimeInfo(string Mode)
    {
        public const string LocalMode = "Local";
        public const string CloudinaryMode = "Cloudinary";
    }

    public static class FileStorageRegistration
    {
        public static FileStorageRuntimeInfo AddOneItbFileStorage(
            this IServiceCollection services,
            IConfiguration configuration,
            IHostEnvironment environment)
        {
            ArgumentNullException.ThrowIfNull(environment);

            FileStorageOptions options = configuration
                .GetSection(FileStorageOptions.SectionName)
                .Get<FileStorageOptions>() ?? new FileStorageOptions();
            string provider = options.Provider?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(provider))
            {
                throw new InvalidOperationException(
                    "FileStorage:Provider debe configurarse explicitamente como Local o Cloudinary.");
            }

            services.Configure<CloudinarySettings>(
                configuration.GetSection("CloudinarySettings"));
            services.Configure<FileStorageOptions>(
                configuration.GetSection(FileStorageOptions.SectionName));

            FileStorageRuntimeInfo runtimeInfo;
            if (string.Equals(provider, FileStorageRuntimeInfo.LocalMode, StringComparison.OrdinalIgnoreCase))
            {
                if (!environment.IsDevelopment())
                {
                    throw new InvalidOperationException(
                        "FileStorage:Provider=Local solo esta permitido en Development.");
                }

                runtimeInfo = new FileStorageRuntimeInfo(FileStorageRuntimeInfo.LocalMode);
                services.AddScoped<IFileStorageService, LocalFileStorageService>();
            }
            else if (string.Equals(provider, FileStorageRuntimeInfo.CloudinaryMode, StringComparison.OrdinalIgnoreCase))
            {
                ValidateTimeout(options.CloudinaryTimeoutSeconds);
                string? cloudinaryUrl = configuration["CloudinarySettings:Url"];
                ValidateCloudinaryUrl(cloudinaryUrl);
                runtimeInfo = new FileStorageRuntimeInfo(
                    FileStorageRuntimeInfo.CloudinaryMode);
                services.AddHttpClient<IFileStorageService, CloudinaryStorageService>(client =>
                {
                    // The adapter owns its linked timeout so caller cancellation remains distinguishable.
                    client.Timeout = Timeout.InfiniteTimeSpan;
                });
            }
            else
            {
                throw new InvalidOperationException(
                    "FileStorage:Provider solo admite Local o Cloudinary.");
            }

            services.AddSingleton(runtimeInfo);
            return runtimeInfo;
        }

        private static void ValidateCloudinaryUrl(string? value)
        {
            if (!Uri.TryCreate(value, UriKind.Absolute, out Uri? parsed) ||
                !string.Equals(parsed.Scheme, "cloudinary", StringComparison.OrdinalIgnoreCase) ||
                string.IsNullOrWhiteSpace(parsed.Host))
            {
                throw InvalidCloudinaryConfiguration();
            }

            string[] credentials = parsed.UserInfo.Split(':', 2);
            if (credentials.Length != 2 ||
                string.IsNullOrWhiteSpace(Uri.UnescapeDataString(credentials[0])) ||
                string.IsNullOrWhiteSpace(Uri.UnescapeDataString(credentials[1])))
            {
                throw InvalidCloudinaryConfiguration();
            }
        }

        private static void ValidateTimeout(int timeoutSeconds)
        {
            if (timeoutSeconds < FileStorageOptions.MinimumCloudinaryTimeoutSeconds ||
                timeoutSeconds > FileStorageOptions.MaximumCloudinaryTimeoutSeconds)
            {
                throw new InvalidOperationException(
                    $"FileStorage:CloudinaryTimeoutSeconds debe estar entre " +
                    $"{FileStorageOptions.MinimumCloudinaryTimeoutSeconds} y " +
                    $"{FileStorageOptions.MaximumCloudinaryTimeoutSeconds}.");
            }
        }

        private static InvalidOperationException InvalidCloudinaryConfiguration()
        {
            return new InvalidOperationException(
                "Cloudinary esta habilitado, pero CloudinarySettings:Url no tiene un formato valido.");
        }
    }
}
