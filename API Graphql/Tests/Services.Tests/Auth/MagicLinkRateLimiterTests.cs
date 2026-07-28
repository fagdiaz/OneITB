using System.Text;
using OneItb.GraphQL.Services.Security;
using Xunit;

namespace Services.Tests.Auth;

public sealed class MagicLinkRateLimiterTests
{
    [Fact]
    public async Task RequestLimit_IsAtomicUnderConcurrency()
    {
        var timeProvider = new MutableTimeProvider(DateTimeOffset.Parse("2026-07-27T12:00:00Z"));
        var options = new MagicLinkRateLimitOptions(
            RequestIpLimit: 20,
            RequestIdentityLimit: 3,
            RedemptionIpLimit: 20,
            RedemptionCredentialLimit: 5,
            Window: TimeSpan.FromMinutes(15),
            MaxTrackedKeys: 100);
        var limiter = new InMemoryMagicLinkRateLimiter(
            options,
            timeProvider,
            Encoding.UTF8.GetBytes("oneitb-test-fingerprint-key-32-bytes"));

        MagicLinkRateLimitDecision[] decisions = await Task.WhenAll(
            Enumerable.Range(0, 20)
                .Select(_ => limiter.TryAcquireRequestAsync(
                    "203.0.113.10",
                    "employer@itbeltran.com.ar")));

        Assert.Equal(3, decisions.Count(decision => decision.IsAllowed));
        Assert.All(
            decisions.Where(decision => !decision.IsAllowed),
            decision => Assert.Equal("rate-limited", decision.ReasonCode));
    }

    [Fact]
    public async Task RequestLimit_UsesIndependentIdentityBuckets()
    {
        var limiter = CreateLimiter(requestIpLimit: 10, requestIdentityLimit: 1);

        MagicLinkRateLimitDecision first = await limiter.TryAcquireRequestAsync(
            "203.0.113.10",
            "first@itbeltran.com.ar");
        MagicLinkRateLimitDecision second = await limiter.TryAcquireRequestAsync(
            "203.0.113.10",
            "second@itbeltran.com.ar");

        Assert.True(first.IsAllowed);
        Assert.True(second.IsAllowed);
    }

    [Fact]
    public async Task RequestLimit_RecoversAfterWindowExpires()
    {
        var timeProvider = new MutableTimeProvider(DateTimeOffset.Parse("2026-07-27T12:00:00Z"));
        var limiter = CreateLimiter(
            requestIpLimit: 1,
            requestIdentityLimit: 1,
            timeProvider: timeProvider);

        Assert.True((await limiter.TryAcquireRequestAsync(
            "203.0.113.10",
            "employer@itbeltran.com.ar")).IsAllowed);
        Assert.False((await limiter.TryAcquireRequestAsync(
            "203.0.113.10",
            "employer@itbeltran.com.ar")).IsAllowed);

        timeProvider.Advance(TimeSpan.FromMinutes(16));

        Assert.True((await limiter.TryAcquireRequestAsync(
            "203.0.113.10",
            "employer@itbeltran.com.ar")).IsAllowed);
    }

    [Fact]
    public async Task RedemptionLimit_IsIndependentFromRequestLimit()
    {
        var limiter = CreateLimiter(
            requestIpLimit: 1,
            requestIdentityLimit: 1,
            redemptionIpLimit: 2,
            redemptionCredentialLimit: 1);

        Assert.True((await limiter.TryAcquireRequestAsync(
            "203.0.113.10",
            "employer@itbeltran.com.ar")).IsAllowed);
        Assert.True((await limiter.TryAcquireRedemptionAsync(
            "203.0.113.10",
            new string('a', 64))).IsAllowed);
        Assert.False((await limiter.TryAcquireRedemptionAsync(
            "203.0.113.10",
            new string('a', 64))).IsAllowed);
    }

    [Fact]
    public async Task ExistingBuckets_RemainUsableAtTrackedKeyCapacity()
    {
        var options = new MagicLinkRateLimitOptions(
            RequestIpLimit: 10,
            RequestIdentityLimit: 10,
            RedemptionIpLimit: 10,
            RedemptionCredentialLimit: 10,
            Window: TimeSpan.FromMinutes(15),
            MaxTrackedKeys: 4);
        var limiter = new InMemoryMagicLinkRateLimiter(
            options,
            TimeProvider.System,
            Encoding.UTF8.GetBytes("oneitb-test-fingerprint-key-32-bytes"));

        Assert.True((await limiter.TryAcquireRequestAsync(
            "203.0.113.10",
            "first@itbeltran.com.ar")).IsAllowed);
        Assert.True((await limiter.TryAcquireRequestAsync(
            "203.0.113.10",
            "second@itbeltran.com.ar")).IsAllowed);
        Assert.True((await limiter.TryAcquireRequestAsync(
            "203.0.113.10",
            "first@itbeltran.com.ar")).IsAllowed);
    }

    private static InMemoryMagicLinkRateLimiter CreateLimiter(
        int requestIpLimit = 10,
        int requestIdentityLimit = 3,
        int redemptionIpLimit = 20,
        int redemptionCredentialLimit = 5,
        TimeProvider? timeProvider = null)
    {
        var options = new MagicLinkRateLimitOptions(
            requestIpLimit,
            requestIdentityLimit,
            redemptionIpLimit,
            redemptionCredentialLimit,
            TimeSpan.FromMinutes(15),
            MaxTrackedKeys: 100);
        return new InMemoryMagicLinkRateLimiter(
            options,
            timeProvider ?? TimeProvider.System,
            Encoding.UTF8.GetBytes("oneitb-test-fingerprint-key-32-bytes"));
    }

    private sealed class MutableTimeProvider : TimeProvider
    {
        private DateTimeOffset _utcNow;

        public MutableTimeProvider(DateTimeOffset utcNow)
        {
            _utcNow = utcNow;
        }

        public override DateTimeOffset GetUtcNow() => _utcNow;

        public void Advance(TimeSpan duration)
        {
            _utcNow = _utcNow.Add(duration);
        }
    }
}
