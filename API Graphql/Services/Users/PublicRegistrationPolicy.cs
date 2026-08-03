using System;

namespace Services.Users
{
    public sealed class PublicRegistrationPolicy
    {
        public const string DefaultInstitutionalDomain = "itbeltran.com.ar";

        public PublicRegistrationPolicy(string? institutionalDomain = null)
        {
            InstitutionalDomain = NormalizeDomain(institutionalDomain);
        }

        public string InstitutionalDomain { get; }

        public bool IsInstitutionalEmail(string normalizedEmail)
        {
            int separator = normalizedEmail.LastIndexOf('@');
            return separator > 0 &&
                separator == normalizedEmail.IndexOf('@') &&
                separator < normalizedEmail.Length - 1 &&
                string.Equals(
                    normalizedEmail[(separator + 1)..],
                    InstitutionalDomain,
                    StringComparison.OrdinalIgnoreCase);
        }

        private static string NormalizeDomain(string? value)
        {
            string normalized = string.IsNullOrWhiteSpace(value)
                ? DefaultInstitutionalDomain
                : value.Trim().TrimStart('@').ToLowerInvariant();
            if (normalized.Length is < 3 or > 253 ||
                normalized.Contains('@') ||
                !normalized.Contains('.'))
            {
                throw new InvalidOperationException(
                    "PublicRegistration:AllowedDomain must contain a valid DNS domain.");
            }

            return normalized;
        }
    }

    public sealed class PublicRegistrationException : ArgumentException
    {
        public PublicRegistrationException(string code, string message)
            : base(message)
        {
            Code = code;
        }

        public PublicRegistrationException(string code, string message, Exception innerException)
            : base(message, innerException)
        {
            Code = code;
        }

        public string Code { get; }
    }
}
