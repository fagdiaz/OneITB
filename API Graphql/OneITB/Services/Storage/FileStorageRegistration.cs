using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

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
            IConfiguration configuration)
        {
            services.Configure<CloudinarySettings>(
                configuration.GetSection("CloudinarySettings"));

            string? cloudinaryUrl = configuration["CloudinarySettings:Url"];
            FileStorageRuntimeInfo runtimeInfo;
            if (string.IsNullOrWhiteSpace(cloudinaryUrl))
            {
                runtimeInfo = new FileStorageRuntimeInfo(FileStorageRuntimeInfo.LocalMode);
                services.AddScoped<IFileStorageService, LocalFileStorageService>();
            }
            else
            {
                ValidateCloudinaryUrl(cloudinaryUrl);
                runtimeInfo = new FileStorageRuntimeInfo(
                    FileStorageRuntimeInfo.CloudinaryMode);
                services.AddHttpClient<IFileStorageService, CloudinaryStorageService>();
            }

            services.AddSingleton(runtimeInfo);
            return runtimeInfo;
        }

        private static void ValidateCloudinaryUrl(string value)
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

        private static InvalidOperationException InvalidCloudinaryConfiguration()
        {
            return new InvalidOperationException(
                "Cloudinary esta habilitado, pero CloudinarySettings:Url no tiene un formato valido.");
        }
    }
}
