using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Services.Auth;
using StackExchange.Redis;

namespace OneItb.GraphQL.Services.Security
{
    public sealed class MicrosoftEntraRateLimitOptions
    {
        public int ClientLimit { get; init; } = 20;
        public int IdentityLimit { get; init; } = 10;
        public TimeSpan Window { get; init; } = TimeSpan.FromMinutes(15);
        public int MaxTrackedKeys { get; init; } = 100_000;

        public static MicrosoftEntraRateLimitOptions FromConfiguration(
            IConfiguration configuration)
        {
            var options = new MicrosoftEntraRateLimitOptions
            {
                ClientLimit = configuration.GetValue(
                    "EntraId:RateLimiting:ClientLimit",
                    20),
                IdentityLimit = configuration.GetValue(
                    "EntraId:RateLimiting:IdentityLimit",
                    10),
                Window = TimeSpan.FromMinutes(configuration.GetValue(
                    "EntraId:RateLimiting:WindowMinutes",
                    15)),
                MaxTrackedKeys = configuration.GetValue(
                    "EntraId:RateLimiting:MaxTrackedKeys",
                    100_000)
            };
            options.Validate();
            return options;
        }

        public void Validate()
        {
            if (ClientLimit is < 1 or > 10_000)
                throw new InvalidOperationException("Entra client rate limit is invalid.");
            if (IdentityLimit is < 1 or > 10_000)
                throw new InvalidOperationException("Entra identity rate limit is invalid.");
            if (Window < TimeSpan.FromSeconds(10) || Window > TimeSpan.FromDays(1))
                throw new InvalidOperationException("Entra rate-limit window is invalid.");
            if (MaxTrackedKeys is < 100 or > 1_000_000)
                throw new InvalidOperationException("Entra tracked-key limit is invalid.");
        }
    }

    public sealed record MicrosoftEntraRateLimitFingerprintKey(byte[] Value)
    {
        public byte[] Value { get; } = Value is { Length: >= 32 }
            ? Value.ToArray()
            : throw new ArgumentException(
                "The Entra rate-limit fingerprint key must contain at least 32 bytes.",
                nameof(Value));
    }

    internal sealed class MicrosoftEntraRateLimitKeyFactory
    {
        private readonly byte[] _key;

        public MicrosoftEntraRateLimitKeyFactory(
            MicrosoftEntraRateLimitFingerprintKey fingerprintKey)
        {
            _key = fingerprintKey.Value;
        }

        public string Client(string clientSource) =>
            $"oneitb:entra:client:{Fingerprint(Normalize(clientSource))}";

        public string Identity(string tenantId, string subjectId) =>
            $"oneitb:entra:identity:{Fingerprint($"{Normalize(tenantId)}|{Normalize(subjectId)}")}";

        private string Fingerprint(string value)
        {
            byte[] digest = HMACSHA256.HashData(
                _key,
                Encoding.UTF8.GetBytes(value));
            return Convert.ToHexString(digest).ToLowerInvariant();
        }

        private static string Normalize(string value) =>
            (value ?? string.Empty).Trim().ToLowerInvariant();
    }

    public sealed class InMemoryMicrosoftEntraRateLimiter : IMicrosoftEntraRateLimiter
    {
        private readonly MicrosoftEntraRateLimitOptions _options;
        private readonly TimeProvider _timeProvider;
        private readonly MicrosoftEntraRateLimitKeyFactory _keyFactory;
        private readonly Dictionary<string, WindowCounter> _counters = new(StringComparer.Ordinal);
        private readonly object _sync = new();
        private int _operationCount;

        public InMemoryMicrosoftEntraRateLimiter(
            MicrosoftEntraRateLimitOptions options,
            TimeProvider timeProvider,
            MicrosoftEntraRateLimitFingerprintKey fingerprintKey)
        {
            options.Validate();
            _options = options;
            _timeProvider = timeProvider;
            _keyFactory = new MicrosoftEntraRateLimitKeyFactory(fingerprintKey);
        }

        public Task<MicrosoftEntraRateLimitDecision> TryAcquireClientAsync(
            string clientSource,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            return Task.FromResult(TryAcquire(
                _keyFactory.Client(clientSource),
                _options.ClientLimit));
        }

        public Task<MicrosoftEntraRateLimitDecision> TryAcquireIdentityAsync(
            string tenantId,
            string subjectId,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            return Task.FromResult(TryAcquire(
                _keyFactory.Identity(tenantId, subjectId),
                _options.IdentityLimit));
        }

        private MicrosoftEntraRateLimitDecision TryAcquire(string key, int limit)
        {
            DateTimeOffset now = _timeProvider.GetUtcNow();
            lock (_sync)
            {
                _operationCount++;
                if ((_operationCount & 0xFF) == 0 || _counters.Count >= _options.MaxTrackedKeys)
                    RemoveExpired(now);
                if (!_counters.TryGetValue(key, out WindowCounter? counter) ||
                    counter.ExpiresAt <= now)
                {
                    if (_counters.Count >= _options.MaxTrackedKeys)
                        return MicrosoftEntraRateLimitDecision.Rejected(TimeSpan.FromSeconds(30));
                    counter = new WindowCounter(now.Add(_options.Window));
                    _counters[key] = counter;
                }

                if (counter.Count >= limit)
                    return MicrosoftEntraRateLimitDecision.Rejected(counter.ExpiresAt - now);

                counter.Count++;
                return MicrosoftEntraRateLimitDecision.Allowed();
            }
        }

        private void RemoveExpired(DateTimeOffset now)
        {
            foreach (string key in _counters
                         .Where(pair => pair.Value.ExpiresAt <= now)
                         .Select(pair => pair.Key)
                         .ToArray())
            {
                _counters.Remove(key);
            }
        }

        private sealed class WindowCounter
        {
            public WindowCounter(DateTimeOffset expiresAt)
            {
                ExpiresAt = expiresAt;
            }

            public int Count { get; set; }
            public DateTimeOffset ExpiresAt { get; }
        }
    }

    public sealed class RedisMicrosoftEntraRateLimiter : IMicrosoftEntraRateLimiter
    {
        private const string AcquireScript = """
            local count = tonumber(redis.call('GET', KEYS[1]) or '0')
            if count >= tonumber(ARGV[1]) then
                return {0, math.max(redis.call('PTTL', KEYS[1]), 0)}
            end
            count = redis.call('INCR', KEYS[1])
            if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[2]) end
            return {1, tonumber(ARGV[2])}
            """;

        private readonly IDatabase _database;
        private readonly MicrosoftEntraRateLimitOptions _options;
        private readonly MicrosoftEntraRateLimitKeyFactory _keyFactory;
        private readonly ILogger<RedisMicrosoftEntraRateLimiter> _logger;

        public RedisMicrosoftEntraRateLimiter(
            IConnectionMultiplexer connectionMultiplexer,
            MicrosoftEntraRateLimitOptions options,
            MicrosoftEntraRateLimitFingerprintKey fingerprintKey,
            ILogger<RedisMicrosoftEntraRateLimiter> logger)
        {
            _database = connectionMultiplexer.GetDatabase();
            options.Validate();
            _options = options;
            _keyFactory = new MicrosoftEntraRateLimitKeyFactory(fingerprintKey);
            _logger = logger;
        }

        public Task<MicrosoftEntraRateLimitDecision> TryAcquireClientAsync(
            string clientSource,
            CancellationToken cancellationToken = default) =>
            TryAcquireAsync(
                _keyFactory.Client(clientSource),
                _options.ClientLimit,
                cancellationToken);

        public Task<MicrosoftEntraRateLimitDecision> TryAcquireIdentityAsync(
            string tenantId,
            string subjectId,
            CancellationToken cancellationToken = default) =>
            TryAcquireAsync(
                _keyFactory.Identity(tenantId, subjectId),
                _options.IdentityLimit,
                cancellationToken);

        private async Task<MicrosoftEntraRateLimitDecision> TryAcquireAsync(
            string key,
            int limit,
            CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            try
            {
                RedisResult result = await _database.ScriptEvaluateAsync(
                        AcquireScript,
                        new RedisKey[] { key },
                        new RedisValue[]
                        {
                            limit,
                            checked((long)_options.Window.TotalMilliseconds)
                        })
                    .WaitAsync(cancellationToken);
                RedisResult[] values = (RedisResult[])result!;
                bool allowed = (long)values[0] == 1;
                long retryMilliseconds = Math.Max(0, (long)values[1]);
                return allowed
                    ? MicrosoftEntraRateLimitDecision.Allowed()
                    : MicrosoftEntraRateLimitDecision.Rejected(
                        TimeSpan.FromMilliseconds(retryMilliseconds));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception exception) when (
                exception is RedisException or TimeoutException)
            {
                _logger.LogError(
                    exception,
                    "Distributed Microsoft Entra rate limiter is unavailable.");
                return MicrosoftEntraRateLimitDecision.Rejected(TimeSpan.FromSeconds(30));
            }
        }
    }
}
