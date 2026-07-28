using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using OneITB.Core.Services.Interfaces;
using IOPath = System.IO.Path;

namespace OneItb.GraphQL.Services.Email
{
    public sealed class PickupDirectoryEmailService : IEmailSender
    {
        private readonly string _pickupDirectory;
        private readonly ILogger<PickupDirectoryEmailService> _logger;

        public PickupDirectoryEmailService(
            string pickupDirectory,
            ILogger<PickupDirectoryEmailService> logger)
        {
            if (string.IsNullOrWhiteSpace(pickupDirectory))
                throw new ArgumentException("Pickup directory is required.", nameof(pickupDirectory));

            _pickupDirectory = IOPath.GetFullPath(pickupDirectory);
            _logger = logger;
        }

        public async Task SendAsync(
            string recipient,
            string subject,
            string body,
            CancellationToken cancellationToken = default)
        {
            string safeRecipient = SanitizeHeader(recipient, nameof(recipient));
            string safeSubject = SanitizeHeader(subject, nameof(subject));
            if (string.IsNullOrWhiteSpace(body))
                throw new ArgumentException("Email body is required.", nameof(body));

            Directory.CreateDirectory(_pickupDirectory);
            string fileName =
                $"{DateTime.UtcNow:yyyyMMddTHHmmssfff}-{Guid.NewGuid():N}.eml";
            string filePath = IOPath.Combine(_pickupDirectory, fileName);
            string content =
                $"Date: {DateTimeOffset.UtcNow:R}\r\n" +
                "From: OneITB <no-reply@oneitb.local>\r\n" +
                $"To: {safeRecipient}\r\n" +
                $"Subject: {safeSubject}\r\n" +
                "MIME-Version: 1.0\r\n" +
                "Content-Type: text/plain; charset=utf-8\r\n" +
                "Content-Transfer-Encoding: 8bit\r\n" +
                "\r\n" +
                body;

            await File.WriteAllTextAsync(
                filePath,
                content,
                new UTF8Encoding(encoderShouldEmitUTF8Identifier: false),
                cancellationToken);

            _logger.LogInformation(
                "Development email written to pickup file {PickupFile}; Subject={Subject}",
                fileName,
                safeSubject);
        }

        private static string SanitizeHeader(string value, string parameterName)
        {
            if (string.IsNullOrWhiteSpace(value) ||
                value.Contains('\r', StringComparison.Ordinal) ||
                value.Contains('\n', StringComparison.Ordinal))
            {
                throw new ArgumentException(
                    "Email header value is invalid.",
                    parameterName);
            }

            return value.Trim();
        }
    }
}
