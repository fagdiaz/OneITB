using Microsoft.Extensions.Configuration;

namespace Services.Auth
{
    public sealed class MicrosoftEntraOptions
    {
        public const string ProviderName = "MicrosoftEntra";

        private MicrosoftEntraOptions(
            bool enabled,
            string tenantId,
            string clientId,
            string audience,
            string requiredScope,
            string allowedDomain,
            int maxTokenLength)
        {
            Enabled = enabled;
            TenantId = tenantId;
            ClientId = clientId;
            Audience = audience;
            RequiredScope = requiredScope;
            AllowedDomain = allowedDomain;
            MaxTokenLength = maxTokenLength;
        }

        public bool Enabled { get; }
        public string TenantId { get; }
        public string ClientId { get; }
        public string Audience { get; }
        public string RequiredScope { get; }
        public string AllowedDomain { get; }
        public int MaxTokenLength { get; }
        public string Authority => $"https://login.microsoftonline.com/{TenantId}/v2.0";
        public string MetadataAddress => $"{Authority}/.well-known/openid-configuration";

        public static MicrosoftEntraOptions FromConfiguration(IConfiguration configuration)
        {
            bool enabled = bool.TryParse(
                configuration["EntraId:Enabled"],
                out bool configuredEnabled) && configuredEnabled;
            if (!enabled)
            {
                return new MicrosoftEntraOptions(
                    false,
                    string.Empty,
                    string.Empty,
                    string.Empty,
                    string.Empty,
                    string.Empty,
                    16_384);
            }

            string tenantId = ReadRequiredGuid(configuration, "EntraId:TenantId");
            string clientId = ReadRequiredGuid(configuration, "EntraId:ClientId");
            string audience = configuration["EntraId:Audience"]?.Trim() ?? clientId;
            string requiredScope = ReadRequired(configuration, "EntraId:RequiredScope");
            string allowedDomain = ReadRequired(configuration, "EntraId:AllowedDomain")
                .TrimStart('@')
                .ToLowerInvariant();
            int maxTokenLength = int.TryParse(
                configuration["EntraId:MaxTokenLength"],
                out int configuredMaxTokenLength)
                ? configuredMaxTokenLength
                : 16_384;

            if (audience.Length > 256)
                throw new InvalidOperationException("EntraId:Audience exceeds 256 characters.");
            if (requiredScope.Length > 128 || requiredScope.Any(char.IsWhiteSpace))
                throw new InvalidOperationException("EntraId:RequiredScope must be one bounded scope value.");
            if (allowedDomain.Length > 150 || allowedDomain.Contains('/') || !allowedDomain.Contains('.'))
                throw new InvalidOperationException("EntraId:AllowedDomain is invalid.");
            if (maxTokenLength is < 1_024 or > 65_536)
                throw new InvalidOperationException("EntraId:MaxTokenLength must be between 1024 and 65536.");

            return new MicrosoftEntraOptions(
                true,
                tenantId,
                clientId,
                audience,
                requiredScope,
                allowedDomain,
                maxTokenLength);
        }

        private static string ReadRequired(IConfiguration configuration, string key)
        {
            string? value = configuration[key]?.Trim();
            return string.IsNullOrWhiteSpace(value)
                ? throw new InvalidOperationException($"{key} is required when EntraId is enabled.")
                : value;
        }

        private static string ReadRequiredGuid(IConfiguration configuration, string key)
        {
            string value = ReadRequired(configuration, key);
            return Guid.TryParse(value, out Guid parsed) && parsed != Guid.Empty
                ? parsed.ToString("D")
                : throw new InvalidOperationException($"{key} must be a non-empty GUID.");
        }
    }
}
