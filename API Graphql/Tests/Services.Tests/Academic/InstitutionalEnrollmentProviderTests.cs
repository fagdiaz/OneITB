using Services.Academic;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Academic;

public sealed class InstitutionalEnrollmentProviderTests
{
    [Fact]
    public async Task ManualMode_RequiresExplicitManualConfirmationWithoutFabricatingData()
    {
        var provider = new ManualInstitutionalEnrollmentProvider(
            new InstitutionalEnrollmentOptions(InstitutionalEnrollmentOptions.ManualMode));

        InstitutionalEnrollmentResult result = await provider.GetEnrollmentAsync(
            new InstitutionalIdentity(
                ServiceTestData.StudentUserId,
                "student@itbeltran.com.ar"));

        Assert.Equal(InstitutionalEnrollmentStatus.ManualConfirmationRequired, result.Status);
        Assert.False(result.IsAuthoritative);
        Assert.Empty(result.CareerCodes);
        Assert.Empty(result.SubjectCodes);
    }

    [Fact]
    public async Task UnavailableMode_FailsClosedWithoutFabricatingEnrollment()
    {
        var provider = new ManualInstitutionalEnrollmentProvider(
            new InstitutionalEnrollmentOptions(InstitutionalEnrollmentOptions.UnavailableMode));

        InstitutionalEnrollmentResult result = await provider.GetEnrollmentAsync(
            new InstitutionalIdentity(
                ServiceTestData.StudentUserId,
                "student@itbeltran.com.ar"));

        Assert.Equal(InstitutionalEnrollmentStatus.Unavailable, result.Status);
        Assert.False(result.IsAuthoritative);
        Assert.Empty(result.CareerCodes);
        Assert.Empty(result.SubjectCodes);
    }

    [Fact]
    public async Task Provider_PropagatesCancellation()
    {
        var provider = new ManualInstitutionalEnrollmentProvider(
            new InstitutionalEnrollmentOptions(null));
        using var source = new CancellationTokenSource();
        source.Cancel();

        await Assert.ThrowsAsync<OperationCanceledException>(() =>
            provider.GetEnrollmentAsync(
                new InstitutionalIdentity(
                    ServiceTestData.StudentUserId,
                    "student@itbeltran.com.ar"),
                source.Token));
    }
}
