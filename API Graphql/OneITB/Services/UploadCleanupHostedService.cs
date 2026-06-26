using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Services.Uploads;

namespace OneItb.GraphQL.Infrastructure
{
    public sealed class UploadCleanupHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UploadCleanupHostedService> _logger;

        public UploadCleanupHostedService(
            IServiceScopeFactory scopeFactory,
            IWebHostEnvironment environment,
            IConfiguration configuration,
            ILogger<UploadCleanupHostedService> logger)
        {
            _scopeFactory = scopeFactory;
            _environment = environment;
            _configuration = configuration;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            UploadCleanupOptions options = LoadOptions();
            if (!options.Enabled)
                return;

            if (options.RunOnStartup)
            {
                await RunCleanupAsync(options, stoppingToken);
            }

            try
            {
                TimeSpan interval = TimeSpan.FromHours(Math.Clamp(options.IntervalHours, 1, 168));
                using PeriodicTimer timer = new(interval);
                while (await timer.WaitForNextTickAsync(stoppingToken))
                {
                    await RunCleanupAsync(options, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
            }
        }

        private async Task RunCleanupAsync(UploadCleanupOptions options, CancellationToken cancellationToken)
        {
            try
            {
                string webRoot = _environment.WebRootPath
                    ?? System.IO.Path.Combine(_environment.ContentRootPath, "wwwroot");
                string uploadsDirectory = System.IO.Path.Combine(webRoot, "uploads");
                TimeSpan retention = TimeSpan.FromHours(Math.Clamp(options.RetentionHours, 1, 720));

                using IServiceScope scope = _scopeFactory.CreateScope();
                IUploadCleanupService cleanupService = scope.ServiceProvider.GetRequiredService<IUploadCleanupService>();
                UploadCleanupResult result = await cleanupService.CleanupAsync(uploadsDirectory, retention, cancellationToken);

                _logger.LogInformation(
                    "Upload cleanup completed. Scanned={ScannedFiles} Deleted={DeletedFiles} Preserved={PreservedFiles} Failed={FailedFiles}",
                    result.ScannedFiles,
                    result.DeletedFiles,
                    result.PreservedFiles,
                    result.FailedFiles);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Upload cleanup failed.");
            }
        }

        private UploadCleanupOptions LoadOptions()
        {
            UploadCleanupOptions options = new();
            _configuration.GetSection("UploadCleanup").Bind(options);
            return options;
        }
    }
}
