using System;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using OneITB.Core.Services.Interfaces;

namespace OneItb.GraphQL.Services.Email
{
    public sealed class SmtpEmailService : IEmailSender
    {
        private readonly SmtpEmailSettings _settings;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(
            SmtpEmailSettings settings,
            ILogger<SmtpEmailService> logger)
        {
            _settings = settings;
            _logger = logger;
        }

        public async Task SendAsync(
            string recipient,
            string subject,
            string body,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(recipient))
                throw new ArgumentException("El destinatario del correo es obligatorio.", nameof(recipient));

            using var message = new MailMessage
            {
                From = new MailAddress(_settings.From ?? _settings.User, "OneITB"),
                Subject = subject.Trim(),
                Body = body.Trim(),
                SubjectEncoding = Encoding.UTF8,
                BodyEncoding = Encoding.UTF8,
                IsBodyHtml = false
            };
            message.To.Add(new MailAddress(recipient.Trim()));

            using var client = new SmtpClient(_settings.Host, _settings.Port)
            {
                EnableSsl = _settings.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Credentials = new NetworkCredential(_settings.User, _settings.Pass)
            };

            await client.SendMailAsync(message, cancellationToken);
            _logger.LogInformation(
                "SMTP email sent. Subject={Subject}",
                subject);
        }
    }
}
