using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace OneItb.GraphQL.Services.Security
{
    public interface IEmployerRequestRateLimiter
    {
        Task<MagicLinkRateLimitDecision> TryAcquireAsync(
            string clientSource,
            string normalizedIdentity,
            CancellationToken cancellationToken = default);
    }

    public sealed record EmployerRequestRateLimitOptions(
        int IpLimit,
        int IdentityLimit,
        TimeSpan Window,
        int MaxTrackedKeys)
    {
        public static EmployerRequestRateLimitOptions FromConfiguration(
            IConfiguration configuration)
        {
            var options = new EmployerRequestRateLimitOptions(
                configuration.GetValue("EmployerRequestRateLimiting:IpLimit", 10),
                configuration.GetValue("EmployerRequestRateLimiting:IdentityLimit", 3),
                TimeSpan.FromMinutes(configuration.GetValue(
                    "EmployerRequestRateLimiting:WindowMinutes",
                    60)),
                configuration.GetValue(
                    "EmployerRequestRateLimiting:MaxTrackedKeys",
                    100000));
            options.Validate();
            return options;
        }

        public void Validate()
        {
            if (IpLimit <= 0 || IdentityLimit <= 0)
                throw new InvalidOperationException("Employer request limits must be positive.");
            if (Window <= TimeSpan.Zero || Window > TimeSpan.FromHours(24))
                throw new InvalidOperationException("Employer request window must be at most 24 hours.");
            if (MaxTrackedKeys is < 4 or > 1_000_000)
                throw new InvalidOperationException("Employer request key capacity is invalid.");
        }
    }

    public sealed class EmployerRequestRateLimitFingerprintKey
    {
        public EmployerRequestRateLimitFingerprintKey(byte[] value)
        {
            if (value is null || value.Length < 32)
                throw new ArgumentException("Fingerprint key must contain at least 32 bytes.", nameof(value));
            Value = value.ToArray();
        }

        public byte[] Value { get; }
    }

    internal sealed class EmployerRequestRateLimitKeyFactory
    {
        private readonly byte[] _key;

        public EmployerRequestRateLimitKeyFactory(
            EmployerRequestRateLimitFingerprintKey key)
        {
            _key = key.Value;
        }

        public string Ip(string source) => Build(
            "ip",
            IPAddress.TryParse(source?.Trim(), out IPAddress? address)
                ? address.ToString()
                : "unknown");

        public string Identity(string identity) => Build(
            "identity",
            string.IsNullOrWhiteSpace(identity) || identity.Length > 600
                ? "invalid"
                : identity.Trim().ToLowerInvariant());

        private string Build(string dimension, string value)
        {
            byte[] digest = HMACSHA256.HashData(
                _key,
                Encoding.UTF8.GetBytes($"{dimension}:{value}"));
            return $"oneitb:employer-request:{dimension}:{Convert.ToHexString(digest).ToLowerInvariant()}";
        }
    }

    public sealed class InMemoryEmployerRequestRateLimiter : IEmployerRequestRateLimiter
    {
        private readonly EmployerRequestRateLimitOptions _options;
        private readonly TimeProvider _timeProvider;
        private readonly EmployerRequestRateLimitKeyFactory _keyFactory;
        private readonly Dictionary<string, WindowCounter> _counters = new(StringComparer.Ordinal);
        private readonly object _sync = new();
        private int _operationCount;

        public InMemoryEmployerRequestRateLimiter(
            EmployerRequestRateLimitOptions options,
            TimeProvider timeProvider,
            EmployerRequestRateLimitFingerprintKey fingerprintKey)
        {
            options.Validate();
            _options = options;
            _timeProvider = timeProvider;
            _keyFactory = new EmployerRequestRateLimitKeyFactory(fingerprintKey);
        }

        public Task<MagicLinkRateLimitDecision> TryAcquireAsync(
            string clientSource,
            string normalizedIdentity,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            DateTimeOffset now = _timeProvider.GetUtcNow();
            string ipKey = _keyFactory.Ip(clientSource);
            string identityKey = _keyFactory.Identity(normalizedIdentity);

            lock (_sync)
            {
                _operationCount++;
                if ((_operationCount & 0xFF) == 0 ||
                    _counters.Count >= _options.MaxTrackedKeys)
                {
                    foreach (string key in _counters
                        .Where(pair => pair.Value.ExpiresAt <= now)
                        .Select(pair => pair.Key)
                        .ToArray())
                    {
                        _counters.Remove(key);
                    }
                }

                int missing = (_counters.ContainsKey(ipKey) ? 0 : 1) +
                    (_counters.ContainsKey(identityKey) ? 0 : 1);
                if (_counters.Count + missing > _options.MaxTrackedKeys)
                    return Task.FromResult(MagicLinkRateLimitDecision.ProviderUnavailable());

                WindowCounter ip = GetCounter(ipKey, now);
                WindowCounter identity = GetCounter(identityKey, now);
                if (ip.Count >= _options.IpLimit ||
                    identity.Count >= _options.IdentityLimit)
                {
                    DateTimeOffset retryAt = ip.Count >= _options.IpLimit
                        ? ip.ExpiresAt
                        : identity.ExpiresAt;
                    return Task.FromResult(
                        MagicLinkRateLimitDecision.RateLimited(retryAt - now));
                }

                ip.Count++;
                identity.Count++;
                return Task.FromResult(MagicLinkRateLimitDecision.Allowed());
            }
        }

        private WindowCounter GetCounter(string key, DateTimeOffset now)
        {
            if (_counters.TryGetValue(key, out WindowCounter? current) &&
                current.ExpiresAt > now)
            {
                return current;
            }

            current = new WindowCounter(now.Add(_options.Window));
            _counters[key] = current;
            return current;
        }

        private sealed class WindowCounter
        {
            public WindowCounter(DateTimeOffset expiresAt) => ExpiresAt = expiresAt;
            public int Count { get; set; }
            public DateTimeOffset ExpiresAt { get; }
        }
    }

    public sealed class RedisEmployerRequestRateLimiter : IEmployerRequestRateLimiter
    {
        private const string AcquireScript = """
            local first = tonumber(redis.call('GET', KEYS[1]) or '0')
            local second = tonumber(redis.call('GET', KEYS[2]) or '0')
            if first >= tonumber(ARGV[1]) or second >= tonumber(ARGV[2]) then
                return {0, math.max(redis.call('PTTL', KEYS[1]), redis.call('PTTL', KEYS[2]), 0)}
            end
            first = redis.call('INCR', KEYS[1])
            if first == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[3]) end
            second = redis.call('INCR', KEYS[2])
            if second == 1 then redis.call('PEXPIRE', KEYS[2], ARGV[3]) end
            return {1, tonumber(ARGV[3])}
            """;

        private readonly IDatabase _database;
        private readonly EmployerRequestRateLimitOptions _options;
        private readonly EmployerRequestRateLimitKeyFactory _keyFactory;
        private readonly ILogger<RedisEmployerRequestRateLimiter> _logger;

        public RedisEmployerRequestRateLimiter(
            IConnectionMultiplexer multiplexer,
            EmployerRequestRateLimitOptions options,
            EmployerRequestRateLimitFingerprintKey key,
            ILogger<RedisEmployerRequestRateLimiter> logger)
        {
            _database = multiplexer.GetDatabase();
            options.Validate();
            _options = options;
            _keyFactory = new EmployerRequestRateLimitKeyFactory(key);
            _logger = logger;
        }

        public async Task<MagicLinkRateLimitDecision> TryAcquireAsync(
            string clientSource,
            string normalizedIdentity,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            try
            {
                RedisResult result = await _database.ScriptEvaluateAsync(
                    AcquireScript,
                    new RedisKey[]
                    {
                        _keyFactory.Ip(clientSource),
                        _keyFactory.Identity(normalizedIdentity)
                    },
                    new RedisValue[]
                    {
                        _options.IpLimit,
                        _options.IdentityLimit,
                        checked((long)_options.Window.TotalMilliseconds)
                    }).WaitAsync(cancellationToken);
                RedisResult[] values = (RedisResult[])result!;
                return (long)values[0] == 1
                    ? MagicLinkRateLimitDecision.Allowed()
                    : MagicLinkRateLimitDecision.RateLimited(
                        TimeSpan.FromMilliseconds(Math.Max(0, (long)values[1])));
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
                    "Distributed employer-request rate limiter is unavailable.");
                return MagicLinkRateLimitDecision.ProviderUnavailable();
            }
        }
    }
}
