namespace OneItb.GraphQL.Infrastructure
{
    public sealed class EmployerOnboardingHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly EmployerOnboardingOptions _options;
        private readonly ILogger<EmployerOnboardingHostedService> _logger;

        public EmployerOnboardingHostedService(
            IServiceScopeFactory scopeFactory,
            EmployerOnboardingOptions options,
            ILogger<EmployerOnboardingHostedService> logger)
        {
            _scopeFactory = scopeFactory;
            _options = options;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.Enabled)
            {
                _logger.LogInformation("Employer onboarding worker is disabled.");
                return;
            }

            try
            {
                if (_options.InitialDelay > TimeSpan.Zero)
                    await Task.Delay(_options.InitialDelay, stoppingToken);

                using var timer = new PeriodicTimer(_options.PollInterval);
                do
                {
                    await DrainAvailableWorkAsync(stoppingToken);
                }
                while (await timer.WaitForNextTickAsync(stoppingToken));
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                _logger.LogDebug("Employer onboarding worker stopped.");
            }
        }

        private async Task DrainAvailableWorkAsync(CancellationToken cancellationToken)
        {
            const int maxMessagesPerCycle = 20;
            for (int index = 0; index < maxMessagesPerCycle; index++)
            {
                try
                {
                    using IServiceScope scope = _scopeFactory.CreateScope();
                    EmployerOnboardingDeliveryProcessor processor = scope.ServiceProvider
                        .GetRequiredService<EmployerOnboardingDeliveryProcessor>();
                    if (!await processor.ProcessNextAsync(cancellationToken))
                        return;
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (Exception exception)
                {
                    _logger.LogError(
                        exception,
                        "Employer onboarding worker cycle failed; the next finite cycle will retry.");
                    return;
                }
            }
        }
    }
}
