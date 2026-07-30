using OneItb.GraphQL.Services.Security;
using Xunit;

namespace Services.Tests.Security;

public sealed class EmployerRequestRateLimiterTests
{
    [Fact]
    public async Task InMemoryLimiter_EnforcesIdentityLimitIndependentlyOfIp()
    {
        var limiter = new InMemoryEmployerRequestRateLimiter(
            new EmployerRequestRateLimitOptions(
                IpLimit: 10,
                IdentityLimit: 2,
                Window: TimeSpan.FromMinutes(10),
                MaxTrackedKeys: 100),
            TimeProvider.System,
            new EmployerRequestRateLimitFingerprintKey(
                Enumerable.Range(0, 32).Select(value => (byte)value).ToArray()));

        Assert.True((await limiter.TryAcquireAsync("127.0.0.1", "email|taxid")).IsAllowed);
        Assert.True((await limiter.TryAcquireAsync("127.0.0.2", "email|taxid")).IsAllowed);
        MagicLinkRateLimitDecision rejected = await limiter.TryAcquireAsync(
            "127.0.0.3",
            "email|taxid");

        Assert.False(rejected.IsAllowed);
        Assert.Equal("rate-limited", rejected.ReasonCode);
        Assert.True(rejected.RetryAfter > TimeSpan.Zero);
    }
}
