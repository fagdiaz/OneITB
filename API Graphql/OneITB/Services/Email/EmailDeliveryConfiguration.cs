using System;
using System.IO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using IOPath = System.IO.Path;

namespace OneItb.GraphQL.Services.Email
{
    public sealed record EmailDeliveryConfiguration(
        SmtpEmailSettings? Smtp,
        string? PickupDirectory)
    {
        public bool UsesSmtp => Smtp is not null;

        public static EmailDeliveryConfiguration FromConfiguration(
            IConfiguration configuration,
            IHostEnvironment environment)
        {
            ArgumentNullException.ThrowIfNull(configuration);
            ArgumentNullException.ThrowIfNull(environment);

            string? host = Normalize(configuration["SmtpSettings:Host"]);
            string? user = Normalize(configuration["SmtpSettings:User"]);
            string? pass = configuration["SmtpSettings:Pass"];
            int port = configuration.GetValue<int?>("SmtpSettings:Port") ?? 0;
            bool hasAnySmtpValue =
                host is not null ||
                user is not null ||
                !string.IsNullOrWhiteSpace(pass) ||
                port > 0;
            bool hasCompleteSmtpConfiguration =
                host is not null &&
                user is not null &&
                !string.IsNullOrWhiteSpace(pass) &&
                port is > 0 and <= 65535;

            if (hasCompleteSmtpConfiguration)
            {
                return new EmailDeliveryConfiguration(
                    new SmtpEmailSettings(
                        host!,
                        port,
                        user!,
                        pass!,
                        Normalize(configuration["SmtpSettings:From"]),
                        configuration.GetValue("SmtpSettings:EnableSsl", true)),
                    null);
            }

            if (environment.IsProduction() || hasAnySmtpValue)
            {
                throw new InvalidOperationException(
                    "Complete SmtpSettings configuration is required; email credentials were not loaded.");
            }

            string configuredPath =
                configuration["Email:PickupDirectory"] ??
                IOPath.Combine("App_Data", "MailDrop");
            string contentRoot = IOPath.GetFullPath(environment.ContentRootPath);
            string pickupDirectory = IOPath.GetFullPath(
                IOPath.IsPathRooted(configuredPath)
                    ? configuredPath
                    : IOPath.Combine(contentRoot, configuredPath));
            string relative = IOPath.GetRelativePath(contentRoot, pickupDirectory);
            if (relative.StartsWith("..", StringComparison.Ordinal) ||
                IOPath.IsPathRooted(relative))
            {
                throw new InvalidOperationException(
                    "Email:PickupDirectory must remain inside the application content root.");
            }

            return new EmailDeliveryConfiguration(null, pickupDirectory);
        }

        private static string? Normalize(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }
    }
}
