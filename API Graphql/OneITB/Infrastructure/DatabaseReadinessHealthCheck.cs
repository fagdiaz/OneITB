using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using OneItb.Data;

namespace OneItb.GraphQL.Infrastructure
{
    public sealed class DatabaseReadinessHealthCheck : IHealthCheck
    {
        private readonly IDbContextFactory<OneItbContext> _contextFactory;
        private readonly ILogger<DatabaseReadinessHealthCheck> _logger;

        public DatabaseReadinessHealthCheck(
            IDbContextFactory<OneItbContext> contextFactory,
            ILogger<DatabaseReadinessHealthCheck> logger)
        {
            _contextFactory = contextFactory;
            _logger = logger;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                await using OneItbContext dbContext =
                    await _contextFactory.CreateDbContextAsync(cancellationToken);
                bool canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);
                return canConnect
                    ? HealthCheckResult.Healthy("Database connection is ready.")
                    : HealthCheckResult.Unhealthy("Database connection is unavailable.");
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception exception)
            {
                _logger.LogWarning(
                    exception,
                    "Database readiness probe failed.");
                return HealthCheckResult.Unhealthy(
                    "Database readiness probe failed.");
            }
        }
    }
}
