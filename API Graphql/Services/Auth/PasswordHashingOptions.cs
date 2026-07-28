using System;
using Microsoft.Extensions.Configuration;

namespace Services.Auth
{
    public sealed class PasswordHashingOptions
    {
        public const int DefaultWorkFactor = 12;
        public const int MinimumWorkFactor = 10;
        public const int MaximumWorkFactor = 14;

        public PasswordHashingOptions(int workFactor = DefaultWorkFactor)
        {
            if (workFactor is < MinimumWorkFactor or > MaximumWorkFactor)
            {
                throw new InvalidOperationException(
                    $"PasswordHashing:WorkFactor must be between {MinimumWorkFactor} and {MaximumWorkFactor}.");
            }

            WorkFactor = workFactor;
        }

        public int WorkFactor { get; }

        public static PasswordHashingOptions FromConfiguration(IConfiguration configuration)
        {
            ArgumentNullException.ThrowIfNull(configuration);
            int workFactor = DefaultWorkFactor;
            string? configuredWorkFactor =
                configuration["PasswordHashing:WorkFactor"];
            if (!string.IsNullOrWhiteSpace(configuredWorkFactor) &&
                !int.TryParse(configuredWorkFactor, out workFactor))
            {
                throw new InvalidOperationException(
                    "PasswordHashing:WorkFactor must be an integer.");
            }

            return new PasswordHashingOptions(workFactor);
        }
    }
}
