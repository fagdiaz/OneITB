using System;
using System.Text;
using System.Linq;
using Microsoft.Extensions.Configuration;

namespace Services.Auth
{
    public sealed class JwtTokenOptions
    {
        private const int MinimumSigningKeyBytes = 32;
        private const int DefaultAccessTokenMinutes = 120;

        public JwtTokenOptions(
            string key,
            string issuer,
            string audience,
            TimeSpan accessTokenLifetime)
        {
            if (Encoding.UTF8.GetByteCount(key) < MinimumSigningKeyBytes)
                throw new InvalidOperationException("Jwt:Key must contain at least 32 bytes.");
            if (key.Distinct().Count() < 12)
                throw new InvalidOperationException("Jwt:Key does not contain sufficient character diversity.");
            if (string.IsNullOrWhiteSpace(issuer))
                throw new InvalidOperationException("Jwt:Issuer is required.");
            if (string.IsNullOrWhiteSpace(audience))
                throw new InvalidOperationException("Jwt:Audience is required.");
            if (accessTokenLifetime <= TimeSpan.Zero || accessTokenLifetime > TimeSpan.FromDays(1))
                throw new InvalidOperationException("Jwt:AccessTokenMinutes must be between 1 and 1440.");

            Key = key;
            Issuer = issuer.Trim();
            Audience = audience.Trim();
            AccessTokenLifetime = accessTokenLifetime;
        }

        public string Key { get; }
        public string Issuer { get; }
        public string Audience { get; }
        public TimeSpan AccessTokenLifetime { get; }

        public static JwtTokenOptions FromConfiguration(IConfiguration configuration)
        {
            ArgumentNullException.ThrowIfNull(configuration);

            string key = configuration["Jwt:Key"] ?? string.Empty;
            string issuer = configuration["Jwt:Issuer"] ?? string.Empty;
            string audience = configuration["Jwt:Audience"] ?? string.Empty;
            int accessTokenMinutes = DefaultAccessTokenMinutes;

            string? configuredLifetime = configuration["Jwt:AccessTokenMinutes"];
            if (!string.IsNullOrWhiteSpace(configuredLifetime) &&
                (!int.TryParse(configuredLifetime, out accessTokenMinutes) ||
                 accessTokenMinutes is < 1 or > 1440))
            {
                throw new InvalidOperationException("Jwt:AccessTokenMinutes must be an integer between 1 and 1440.");
            }

            return new JwtTokenOptions(
                key,
                issuer,
                audience,
                TimeSpan.FromMinutes(accessTokenMinutes));
        }
    }
}
