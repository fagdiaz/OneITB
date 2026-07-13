using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using Services.Notifications;

namespace OneItb.GraphQL.Infrastructure
{
    public sealed class UnreadMessageReminderHostedService : BackgroundService
    {
        private const int MaxRecipientsPerCycle = 500;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UnreadMessageReminderHostedService> _logger;

        public UnreadMessageReminderHostedService(
            IServiceScopeFactory scopeFactory,
            IConfiguration configuration,
            ILogger<UnreadMessageReminderHostedService> logger)
        {
            _scopeFactory = scopeFactory;
            _configuration = configuration;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                if (!_configuration.GetValue("UnreadMessageReminder:Enabled", true))
                {
                    _logger.LogInformation("Unread message reminder worker is disabled.");
                    return;
                }

                int initialDelaySeconds = Math.Clamp(
                    _configuration.GetValue("UnreadMessageReminder:InitialDelaySeconds", 30),
                    0,
                    600);
                int intervalMinutes = Math.Clamp(
                    _configuration.GetValue("UnreadMessageReminder:IntervalMinutes", 15),
                    1,
                    1440);

                if (initialDelaySeconds > 0)
                    await Task.Delay(TimeSpan.FromSeconds(initialDelaySeconds), stoppingToken);

                using var timer = new PeriodicTimer(TimeSpan.FromMinutes(intervalMinutes));
                do
                {
                    await RunCycleSafelyAsync(stoppingToken);
                }
                while (await timer.WaitForNextTickAsync(stoppingToken));
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                _logger.LogDebug("Unread message reminder worker stopped.");
            }
        }

        private async Task RunCycleSafelyAsync(CancellationToken cancellationToken)
        {
            try
            {
                using IServiceScope scope = _scopeFactory.CreateScope();
                OneItbContext context = scope.ServiceProvider.GetRequiredService<OneItbContext>();
                INotificationService notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                int thresholdMinutes = Math.Clamp(
                    _configuration.GetValue("UnreadMessageReminder:ThresholdMinutes", 60),
                    15,
                    10080);
                DateTime cutoff = DateTime.UtcNow.AddMinutes(-thresholdMinutes);

                var recipients = await context.Messages
                    .AsNoTracking()
                    .Where(message =>
                        !message.IsRead &&
                        message.SentAt <= cutoff &&
                        message.Receiver.IsActive)
                    .GroupBy(message => message.ReceiverId)
                    .Select(group => new
                    {
                        UserId = group.Key,
                        Count = group.Count(),
                        LatestMessageAt = group.Max(message => message.SentAt)
                    })
                    .OrderBy(item => item.UserId)
                    .Take(MaxRecipientsPerCycle)
                    .ToListAsync(cancellationToken);

                foreach (var recipient in recipients)
                {
                    await notificationService.UpsertUnreadMessageReminderAsync(
                        recipient.UserId,
                        recipient.Count,
                        recipient.LatestMessageAt,
                        cancellationToken);
                }

                if (recipients.Count > 0)
                {
                    _logger.LogInformation(
                        "Unread message reminder cycle processed {RecipientCount} recipients.",
                        recipients.Count);
                }
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Unread message reminder cycle failed; the next scheduled cycle will retry.");
            }
        }
    }
}
