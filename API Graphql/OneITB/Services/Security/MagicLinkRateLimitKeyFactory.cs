using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace OneItb.GraphQL.Services.Security
{
    internal sealed class MagicLinkRateLimitKeyFactory
    {
        private const int MaxInputLength = 512;
        private readonly byte[] _fingerprintKey;

        public MagicLinkRateLimitKeyFactory(MagicLinkRateLimitFingerprintKey fingerprintKey)
        {
            _fingerprintKey = fingerprintKey.Value;
        }

        public string RequestIp(string clientSource)
            => Build("request:ip", NormalizeNetworkSource(clientSource));

        public string RequestIdentity(string email)
            => Build("request:identity", NormalizeBounded(email, lowerCase: true));

        public string RedemptionIp(string clientSource)
            => Build("redeem:ip", NormalizeNetworkSource(clientSource));

        public string RedemptionCredential(string credential)
            => Build("redeem:credential", NormalizeBounded(credential, lowerCase: true));

        private string Build(string dimension, string value)
        {
            byte[] payload = Encoding.UTF8.GetBytes($"{dimension}:{value}");
            byte[] digest = HMACSHA256.HashData(_fingerprintKey, payload);
            return $"oneitb:magiclink:{dimension}:{Convert.ToHexString(digest).ToLowerInvariant()}";
        }

        private static string NormalizeNetworkSource(string value)
        {
            string normalized = NormalizeBounded(value, lowerCase: false);
            return IPAddress.TryParse(normalized, out IPAddress? address)
                ? address.ToString()
                : "unknown";
        }

        private static string NormalizeBounded(string? value, bool lowerCase)
        {
            string normalized = value?.Trim() ?? string.Empty;
            if (normalized.Length == 0 || normalized.Length > MaxInputLength)
                return "invalid";
            return lowerCase ? normalized.ToLowerInvariant() : normalized;
        }
    }
}
