using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace OneItb.GraphQL.Services.Security
{
    public sealed class RedisMagicLinkRateLimiter : IMagicLinkRateLimiter
    {
        private const string AcquireScript = """
            local first = tonumber(redis.call('GET', KEYS[1]) or '0')
            local second = tonumber(redis.call('GET', KEYS[2]) or '0')
            if first >= tonumber(ARGV[1]) or second >= tonumber(ARGV[2]) then
                local firstTtl = redis.call('PTTL', KEYS[1])
                local secondTtl = redis.call('PTTL', KEYS[2])
                return {0, math.max(firstTtl, secondTtl, 0)}
            end
            first = redis.call('INCR', KEYS[1])
            if first == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[3]) end
            second = redis.call('INCR', KEYS[2])
            if second == 1 then redis.call('PEXPIRE', KEYS[2], ARGV[3]) end
            return {1, tonumber(ARGV[3])}
            """;

        private readonly IDatabase _database;
        private readonly MagicLinkRateLimitOptions _options;
        private readonly MagicLinkRateLimitKeyFactory _keyFactory;
        private readonly ILogger<RedisMagicLinkRateLimiter> _logger;

        public RedisMagicLinkRateLimiter(
            IConnectionMultiplexer connectionMultiplexer,
            MagicLinkRateLimitOptions options,
            MagicLinkRateLimitFingerprintKey fingerprintKey,
            ILogger<RedisMagicLinkRateLimiter> logger)
        {
            _database = connectionMultiplexer.GetDatabase();
            options.Validate();
            _options = options;
            _keyFactory = new MagicLinkRateLimitKeyFactory(fingerprintKey);
            _logger = logger;
        }

        public Task<MagicLinkRateLimitDecision> TryAcquireRequestAsync(
            string clientSource,
            string email,
            CancellationToken cancellationToken = default)
        {
            return TryAcquireAsync(
                _keyFactory.RequestIp(clientSource),
                _options.RequestIpLimit,
                _keyFactory.RequestIdentity(email),
                _options.RequestIdentityLimit,
                cancellationToken);
        }

        public Task<MagicLinkRateLimitDecision> TryAcquireRedemptionAsync(
            string clientSource,
            string credential,
            CancellationToken cancellationToken = default)
        {
            return TryAcquireAsync(
                _keyFactory.RedemptionIp(clientSource),
                _options.RedemptionIpLimit,
                _keyFactory.RedemptionCredential(credential),
                _options.RedemptionCredentialLimit,
                cancellationToken);
        }

        private async Task<MagicLinkRateLimitDecision> TryAcquireAsync(
            string firstKey,
            int firstLimit,
            string secondKey,
            int secondLimit,
            CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            try
            {
                Task<RedisResult> operation = _database.ScriptEvaluateAsync(
                    AcquireScript,
                    new RedisKey[] { firstKey, secondKey },
                    new RedisValue[]
                    {
                        firstLimit,
                        secondLimit,
                        checked((long)_options.Window.TotalMilliseconds)
                    });
                RedisResult result = await operation.WaitAsync(cancellationToken);
                RedisResult[] values = (RedisResult[])result!;
                bool allowed = (long)values[0] == 1;
                long retryMilliseconds = Math.Max(0, (long)values[1]);
                return allowed
                    ? MagicLinkRateLimitDecision.Allowed()
                    : MagicLinkRateLimitDecision.RateLimited(
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
                    "Distributed Magic Link rate limiter is unavailable.");
                return MagicLinkRateLimitDecision.ProviderUnavailable();
            }
        }
    }
}
