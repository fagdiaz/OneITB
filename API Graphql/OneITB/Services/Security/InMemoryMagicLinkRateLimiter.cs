namespace OneItb.GraphQL.Services.Security
{
    public sealed class InMemoryMagicLinkRateLimiter : IMagicLinkRateLimiter
    {
        private readonly MagicLinkRateLimitOptions _options;
        private readonly TimeProvider _timeProvider;
        private readonly MagicLinkRateLimitKeyFactory _keyFactory;
        private readonly Dictionary<string, WindowCounter> _counters = new(StringComparer.Ordinal);
        private readonly object _sync = new();
        private int _operationCount;

        public InMemoryMagicLinkRateLimiter(
            MagicLinkRateLimitOptions options,
            TimeProvider timeProvider,
            MagicLinkRateLimitFingerprintKey fingerprintKey)
        {
            options.Validate();
            _options = options;
            _timeProvider = timeProvider;
            _keyFactory = new MagicLinkRateLimitKeyFactory(fingerprintKey);
        }

        public InMemoryMagicLinkRateLimiter(
            MagicLinkRateLimitOptions options,
            TimeProvider timeProvider,
            byte[] fingerprintKey)
            : this(options, timeProvider, new MagicLinkRateLimitFingerprintKey(fingerprintKey))
        {
        }

        public Task<MagicLinkRateLimitDecision> TryAcquireRequestAsync(
            string clientSource,
            string email,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            return Task.FromResult(TryAcquire(
                (_keyFactory.RequestIp(clientSource), _options.RequestIpLimit),
                (_keyFactory.RequestIdentity(email), _options.RequestIdentityLimit)));
        }

        public Task<MagicLinkRateLimitDecision> TryAcquireRedemptionAsync(
            string clientSource,
            string credential,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            return Task.FromResult(TryAcquire(
                (_keyFactory.RedemptionIp(clientSource), _options.RedemptionIpLimit),
                (_keyFactory.RedemptionCredential(credential), _options.RedemptionCredentialLimit)));
        }

        private MagicLinkRateLimitDecision TryAcquire(
            (string Key, int Limit) first,
            (string Key, int Limit) second)
        {
            DateTimeOffset now = _timeProvider.GetUtcNow();
            DateTimeOffset windowEnd = now.Add(_options.Window);

            lock (_sync)
            {
                _operationCount++;
                if ((_operationCount & 0xFF) == 0 || _counters.Count >= _options.MaxTrackedKeys)
                    RemoveExpired(now);

                int missingKeys =
                    (_counters.ContainsKey(first.Key) ? 0 : 1) +
                    (_counters.ContainsKey(second.Key) ? 0 : 1);
                if (_counters.Count + missingKeys > _options.MaxTrackedKeys)
                    return MagicLinkRateLimitDecision.ProviderUnavailable();

                WindowCounter firstCounter = GetCurrentCounter(first.Key, now, windowEnd);
                WindowCounter secondCounter = GetCurrentCounter(second.Key, now, windowEnd);
                if (firstCounter.Count >= first.Limit || secondCounter.Count >= second.Limit)
                {
                    DateTimeOffset retryAt = firstCounter.Count >= first.Limit
                        ? firstCounter.ExpiresAt
                        : secondCounter.ExpiresAt;
                    return MagicLinkRateLimitDecision.RateLimited(retryAt - now);
                }

                firstCounter.Count++;
                secondCounter.Count++;
                return MagicLinkRateLimitDecision.Allowed();
            }
        }

        private WindowCounter GetCurrentCounter(
            string key,
            DateTimeOffset now,
            DateTimeOffset windowEnd)
        {
            if (_counters.TryGetValue(key, out WindowCounter? counter) &&
                counter.ExpiresAt > now)
            {
                return counter;
            }

            counter = new WindowCounter(windowEnd);
            _counters[key] = counter;
            return counter;
        }

        private void RemoveExpired(DateTimeOffset now)
        {
            string[] expiredKeys = _counters
                .Where(pair => pair.Value.ExpiresAt <= now)
                .Select(pair => pair.Key)
                .ToArray();
            foreach (string key in expiredKeys)
                _counters.Remove(key);
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
}
