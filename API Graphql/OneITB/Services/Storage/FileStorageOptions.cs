namespace OneItb.GraphQL.Services.Storage
{
    public sealed class FileStorageOptions
    {
        public const string SectionName = "FileStorage";
        public const int DefaultCloudinaryTimeoutSeconds = 20;
        public const int MinimumCloudinaryTimeoutSeconds = 1;
        public const int MaximumCloudinaryTimeoutSeconds = 120;

        public string? Provider { get; set; }
        public int CloudinaryTimeoutSeconds { get; set; } = DefaultCloudinaryTimeoutSeconds;
    }
}
