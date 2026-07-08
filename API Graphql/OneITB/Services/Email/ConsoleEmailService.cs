using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace OneItb.GraphQL.Services.Email
{
    public sealed class ConsoleEmailService : IEmailSender
    {
        private readonly ILogger<ConsoleEmailService> _logger;

        public ConsoleEmailService(ILogger<ConsoleEmailService> logger)
        {
            _logger = logger;
        }

        public Task SendAsync(
            string recipient,
            string subject,
            string body,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation(
                "Email fallback active. To={Recipient}; Subject={Subject}; Body={Body}",
                recipient,
                subject,
                body);
            return Task.CompletedTask;
        }
    }
}
