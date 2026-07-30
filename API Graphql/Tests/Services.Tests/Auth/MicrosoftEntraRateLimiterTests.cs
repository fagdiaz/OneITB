using System.Text;
using OneItb.GraphQL.Services.Security;
using Xunit;

namespace Services.Tests.Auth;

public sealed class MicrosoftEntraRateLimiterTests
{
    [Fact]
    public async Task ClientAndIdentityLimits_AreIndependentAndBounded()
    {
        var options = new MicrosoftEntraRateLimitOptions
        {
            ClientLimit = 2,
            IdentityLimit = 1,
            Window = TimeSpan.FromMinutes(15),
            MaxTrackedKeys = 100
        };
        var limiter = new InMemoryMicrosoftEntraRateLimiter(
            options,
            TimeProvider.System,
            new MicrosoftEntraRateLimitFingerprintKey(
                Encoding.UTF8.GetBytes("oneitb-entra-test-key-at-least-32-bytes")));

        Assert.True((await limiter.TryAcquireClientAsync("203.0.113.1")).IsAllowed);
        Assert.True((await limiter.TryAcquireClientAsync("203.0.113.1")).IsAllowed);
        Assert.False((await limiter.TryAcquireClientAsync("203.0.113.1")).IsAllowed);

        Assert.True((await limiter.TryAcquireIdentityAsync(
            "tenant-a",
            "subject-a")).IsAllowed);
        Assert.False((await limiter.TryAcquireIdentityAsync(
            "tenant-a",
            "subject-a")).IsAllowed);
        Assert.True((await limiter.TryAcquireIdentityAsync(
            "tenant-a",
            "subject-b")).IsAllowed);
    }
}
