using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace OneItb.GraphQL.Infrastructure
{
    public sealed class CorrelationIdMiddleware
    {
        public const string HeaderName = "X-Correlation-ID";
        private const int MaxCorrelationIdLength = 128;

        private readonly RequestDelegate _next;
        private readonly ILogger<CorrelationIdMiddleware> _logger;

        public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            string correlationId = ResolveCorrelationId(context);
            context.Items[HeaderName] = correlationId;
            context.Response.Headers[HeaderName] = correlationId;

            using IDisposable? scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId
            });

            var stopwatch = Stopwatch.StartNew();
            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();
                _logger.LogInformation(
                    "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMilliseconds} ms with correlation {CorrelationId}",
                    context.Request.Method,
                    context.Request.Path.Value,
                    context.Response.StatusCode,
                    stopwatch.ElapsedMilliseconds,
                    correlationId);
            }
        }

        private static string ResolveCorrelationId(HttpContext context)
        {
            string? incoming = context.Request.Headers[HeaderName].FirstOrDefault();
            if (IsSafeCorrelationId(incoming))
            {
                return incoming!.Trim();
            }

            return Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N");
        }

        private static bool IsSafeCorrelationId(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return false;

            string trimmed = value.Trim();
            if (trimmed.Length > MaxCorrelationIdLength)
                return false;

            return trimmed.All(character =>
                character is >= 'a' and <= 'z'
                || character is >= 'A' and <= 'Z'
                || character is >= '0' and <= '9'
                || character is '-' or '_' or '.' or ':');
        }
    }
}
