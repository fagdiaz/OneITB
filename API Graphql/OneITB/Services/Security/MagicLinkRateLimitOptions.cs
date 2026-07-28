using Microsoft.Extensions.Configuration;

namespace OneItb.GraphQL.Services.Security
{
    public sealed record MagicLinkRateLimitOptions(
        int RequestIpLimit,
        int RequestIdentityLimit,
        int RedemptionIpLimit,
        int RedemptionCredentialLimit,
        TimeSpan Window,
        int MaxTrackedKeys)
    {
        public static MagicLinkRateLimitOptions FromConfiguration(IConfiguration configuration)
        {
            ArgumentNullException.ThrowIfNull(configuration);
            var options = new MagicLinkRateLimitOptions(
                RequestIpLimit: configuration.GetValue("MagicLinkRateLimiting:RequestIpLimit", 10),
                RequestIdentityLimit: configuration.GetValue("MagicLinkRateLimiting:RequestIdentityLimit", 3),
                RedemptionIpLimit: configuration.GetValue("MagicLinkRateLimiting:RedemptionIpLimit", 20),
                RedemptionCredentialLimit: configuration.GetValue("MagicLinkRateLimiting:RedemptionCredentialLimit", 5),
                Window: TimeSpan.FromMinutes(
                    configuration.GetValue("MagicLinkRateLimiting:WindowMinutes", 15)),
                MaxTrackedKeys: configuration.GetValue("MagicLinkRateLimiting:MaxTrackedKeys", 100000));
            options.Validate();
            return options;
        }

        public void Validate()
        {
            if (RequestIpLimit <= 0 ||
                RequestIdentityLimit <= 0 ||
                RedemptionIpLimit <= 0 ||
                RedemptionCredentialLimit <= 0)
            {
                throw new InvalidOperationException(
                    "Magic Link rate limits must be positive.");
            }

            if (Window <= TimeSpan.Zero || Window > TimeSpan.FromHours(24))
            {
                throw new InvalidOperationException(
                    "Magic Link rate-limit window must be between zero and 24 hours.");
            }

            if (MaxTrackedKeys < 4 || MaxTrackedKeys > 1_000_000)
            {
                throw new InvalidOperationException(
                    "Magic Link MaxTrackedKeys must be between 4 and 1000000.");
            }
        }
    }

    public sealed class MagicLinkRateLimitFingerprintKey
    {
        public MagicLinkRateLimitFingerprintKey(byte[] value)
        {
            ArgumentNullException.ThrowIfNull(value);
            if (value.Length < 32)
                throw new ArgumentException("Fingerprint key must contain at least 32 bytes.", nameof(value));
            Value = value.ToArray();
        }

        public byte[] Value { get; }
    }
}
