using OneItb.GraphQL.Services.Security;
using Xunit;

namespace Services.Tests.Security;

public sealed class PublicRegistrationRateLimiterTests
{
    private static readonly PublicRegistrationRateLimitFingerprintKey FingerprintKey =
        new(Enumerable.Range(1, 32).Select(value => (byte)value).ToArray());

    [Fact]
    public async Task InMemoryLimiter_EnforcesIdentityLimitAcrossDifferentSources()
    {
        var limiter = CreateLimiter(ipLimit: 10, identityLimit: 2);

        Assert.True((await limiter.TryAcquireAsync(
            "127.0.0.1",
            "student@itbeltran.com.ar")).IsAllowed);
        Assert.True((await limiter.TryAcquireAsync(
            "127.0.0.2",
            "STUDENT@ITBELTRAN.COM.AR")).IsAllowed);

        MagicLinkRateLimitDecision rejected = await limiter.TryAcquireAsync(
            "127.0.0.3",
            "student@itbeltran.com.ar");

        Assert.False(rejected.IsAllowed);
        Assert.Equal("rate-limited", rejected.ReasonCode);
        Assert.True(rejected.RetryAfter > TimeSpan.Zero);
    }

    [Fact]
    public async Task InMemoryLimiter_EnforcesSourceLimitAcrossDifferentIdentities()
    {
        var limiter = CreateLimiter(ipLimit: 2, identityLimit: 10);

        Assert.True((await limiter.TryAcquireAsync(
            "127.0.0.1",
            "first@itbeltran.com.ar")).IsAllowed);
        Assert.True((await limiter.TryAcquireAsync(
            "127.0.0.1",
            "second@itbeltran.com.ar")).IsAllowed);

        MagicLinkRateLimitDecision rejected = await limiter.TryAcquireAsync(
            "127.0.0.1",
            "third@itbeltran.com.ar");

        Assert.False(rejected.IsAllowed);
        Assert.Equal("rate-limited", rejected.ReasonCode);
    }

    [Fact]
    public async Task InMemoryLimiter_PropagatesPreCancelledToken()
    {
        var limiter = CreateLimiter(ipLimit: 2, identityLimit: 2);
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            limiter.TryAcquireAsync(
                "127.0.0.1",
                "student@itbeltran.com.ar",
                cancellation.Token));
    }

    private static InMemoryPublicRegistrationRateLimiter CreateLimiter(
        int ipLimit,
        int identityLimit)
    {
        return new InMemoryPublicRegistrationRateLimiter(
            new PublicRegistrationRateLimitOptions(
                ipLimit,
                identityLimit,
                TimeSpan.FromMinutes(10),
                MaxTrackedKeys: 100),
            TimeProvider.System,
            FingerprintKey);
    }
}
