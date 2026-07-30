using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace OneItb.GraphQL.Infrastructure
{
    public sealed class EmployerOnboardingDeliveryProcessor
    {
        private readonly OneItbContext _context;
        private readonly IEmployerAuthService _employerAuthService;
        private readonly EmployerOnboardingOptions _options;
        private readonly TimeProvider _timeProvider;
        private readonly ILogger<EmployerOnboardingDeliveryProcessor> _logger;

        public EmployerOnboardingDeliveryProcessor(
            OneItbContext context,
            IEmployerAuthService employerAuthService,
            EmployerOnboardingOptions options,
            TimeProvider timeProvider,
            ILogger<EmployerOnboardingDeliveryProcessor> logger)
        {
            _context = context;
            _employerAuthService = employerAuthService;
            _options = options;
            _timeProvider = timeProvider;
            _logger = logger;
        }

        public async Task<bool> ProcessNextAsync(
            CancellationToken cancellationToken = default)
        {
            DateTime utcNow = _timeProvider.GetUtcNow().UtcDateTime;
            Guid? candidateId = await _context.EmployerOnboardingOutboxMessages
                .AsNoTracking()
                .Where(message =>
                    message.Attempts < _options.MaxAttempts &&
                    message.NextAttemptAt <= utcNow &&
                    (message.Status == EmployerOutboxStatus.Pending ||
                     (message.Status == EmployerOutboxStatus.Processing &&
                      message.LeaseExpiresAt <= utcNow)))
                .OrderBy(message => message.NextAttemptAt)
                .ThenBy(message => message.CreatedAt)
                .Select(message => (Guid?)message.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (!candidateId.HasValue)
                return false;

            EmployerOnboardingOutboxMessage? message = await _context
                .EmployerOnboardingOutboxMessages
                .Include(item => item.EmployerRequest)
                .SingleOrDefaultAsync(
                    item => item.Id == candidateId.Value,
                    cancellationToken);
            if (message is null ||
                message.Attempts >= _options.MaxAttempts ||
                message.NextAttemptAt > utcNow ||
                (message.Status != EmployerOutboxStatus.Pending &&
                 !(message.Status == EmployerOutboxStatus.Processing &&
                   message.LeaseExpiresAt <= utcNow)))
            {
                return false;
            }

            message.Status = EmployerOutboxStatus.Processing;
            message.LeaseExpiresAt = utcNow.Add(_options.LeaseDuration);
            message.Attempts++;
            message.EmployerRequest.LastEmailAttemptAt = utcNow;
            message.EmployerRequest.EmailDeliveryAttempts = message.Attempts;

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                return false;
            }

            try
            {
                await _employerAuthService.SendWelcomeMagicLinkAsync(
                    message.EmployerRequestId,
                    cancellationToken);

                DateTime completedAt = _timeProvider.GetUtcNow().UtcDateTime;
                message.Status = EmployerOutboxStatus.Delivered;
                message.ProcessedAt = completedAt;
                message.LeaseExpiresAt = null;
                message.LastErrorCode = null;
                message.EmployerRequest.EmailDeliveryStatus =
                    EmployerEmailDeliveryStatus.Delivered;
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation(
                    "Employer onboarding email delivered for request {EmployerRequestId}.",
                    message.EmployerRequestId);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception exception)
            {
                DateTime failedAt = _timeProvider.GetUtcNow().UtcDateTime;
                bool exhausted = message.Attempts >= _options.MaxAttempts;
                message.Status = exhausted
                    ? EmployerOutboxStatus.Failed
                    : EmployerOutboxStatus.Pending;
                message.NextAttemptAt = failedAt.Add(ComputeRetryDelay(message.Attempts));
                message.LeaseExpiresAt = null;
                message.LastErrorCode = exception.GetType().Name[..Math.Min(
                    exception.GetType().Name.Length,
                    80)];
                message.EmployerRequest.EmailDeliveryStatus = exhausted
                    ? EmployerEmailDeliveryStatus.Failed
                    : EmployerEmailDeliveryStatus.Pending;
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogWarning(
                    "Employer onboarding email attempt {Attempt}/{MaxAttempts} failed for request {EmployerRequestId}; token and PII were not logged.",
                    message.Attempts,
                    _options.MaxAttempts,
                    message.EmployerRequestId);
            }

            return true;
        }

        private TimeSpan ComputeRetryDelay(int attempts)
        {
            double multiplier = Math.Pow(2, Math.Clamp(attempts - 1, 0, 8));
            double seconds = Math.Min(
                _options.BaseRetryDelay.TotalSeconds * multiplier,
                TimeSpan.FromHours(12).TotalSeconds);
            return TimeSpan.FromSeconds(seconds);
        }
    }
}
