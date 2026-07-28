using System;
using Microsoft.Extensions.Configuration;

namespace Services.Auth
{
    public sealed class MagicLinkDeliveryOptions
    {
        public MagicLinkDeliveryOptions(string frontendBaseUrl)
        {
            if (!Uri.TryCreate(frontendBaseUrl, UriKind.Absolute, out Uri? baseUri) ||
                (baseUri.Scheme != Uri.UriSchemeHttp &&
                 baseUri.Scheme != Uri.UriSchemeHttps))
            {
                throw new InvalidOperationException(
                    "MagicLink:FrontendBaseUrl must be an absolute HTTP or HTTPS URL.");
            }

            FrontendBaseUrl = baseUri.GetLeftPart(UriPartial.Authority).TrimEnd('/');
        }

        public string FrontendBaseUrl { get; }

        public static MagicLinkDeliveryOptions FromConfiguration(
            IConfiguration configuration,
            bool isProduction)
        {
            ArgumentNullException.ThrowIfNull(configuration);
            string? configuredUrl = configuration["MagicLink:FrontendBaseUrl"];
            if (string.IsNullOrWhiteSpace(configuredUrl))
            {
                if (isProduction)
                {
                    throw new InvalidOperationException(
                        "MagicLink:FrontendBaseUrl is required in Production.");
                }

                configuredUrl = "http://localhost:5173";
            }

            var options = new MagicLinkDeliveryOptions(configuredUrl);
            if (isProduction &&
                !options.FrontendBaseUrl.StartsWith(
                    "https://",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "MagicLink:FrontendBaseUrl must use HTTPS in Production.");
            }

            return options;
        }
    }
}
