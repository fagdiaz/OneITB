using Services.Auth;
using Xunit;

namespace Services.Tests.Auth;

public sealed class PasswordHasherTests
{
    [Fact]
    public void HashAndVerify_UseConfiguredBcryptWorkFactor()
    {
        var hasher = new BcryptPasswordHasher(new PasswordHashingOptions(10));

        string hash = hasher.Hash("Test1234!");

        Assert.True(hasher.Verify("Test1234!", hash));
        Assert.False(hasher.Verify("Wrong1234!", hash));
        Assert.False(hasher.NeedsRehash(hash));
    }

    [Fact]
    public void NeedsRehash_DetectsLegacyLowerCostHash()
    {
        var hasher = new BcryptPasswordHasher(new PasswordHashingOptions(10));
        string legacyHash = BCrypt.Net.BCrypt.HashPassword("Test1234!", workFactor: 4);

        Assert.True(hasher.Verify("Test1234!", legacyHash));
        Assert.True(hasher.NeedsRehash(legacyHash));
    }

    [Fact]
    public void NeedsRehash_DoesNotDowngradeStrongerExistingHash()
    {
        var hasher = new BcryptPasswordHasher(new PasswordHashingOptions(10));
        string strongerHash = BCrypt.Net.BCrypt.HashPassword(
            "Test1234!",
            workFactor: 11);

        Assert.True(hasher.Verify("Test1234!", strongerHash));
        Assert.False(hasher.NeedsRehash(strongerHash));
    }

    [Theory]
    [InlineData(9)]
    [InlineData(15)]
    public void Options_RejectUnsafeOrExcessiveWorkFactor(int workFactor)
    {
        Assert.Throws<InvalidOperationException>(
            () => new PasswordHashingOptions(workFactor));
    }
}
