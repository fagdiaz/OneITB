using Services.Academic;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Academic;

public sealed class InstitutionalEnrollmentProviderTests
{
    [Fact]
    public async Task SelfDeclaredMode_RequiresExplicitConfirmationWithoutFabricatingData()
    {
        var provider = new SelfDeclaredInstitutionalEnrollmentProvider(
            new InstitutionalEnrollmentOptions(InstitutionalEnrollmentOptions.SelfDeclaredMode));

        InstitutionalEnrollmentResult result = await provider.GetEnrollmentAsync(
            new InstitutionalIdentity(
                ServiceTestData.StudentUserId,
                "student@itbeltran.com.ar"));

        Assert.Equal(InstitutionalEnrollmentStatus.SelfDeclarationRequired, result.Status);
        Assert.Equal(InstitutionalEnrollmentSource.SelfDeclared, result.Source);
        Assert.False(result.IsAuthoritative);
        Assert.Null(result.CareerCode);
        Assert.Empty(result.SubjectCodes);
        Assert.NotEqual(default, result.ObservedAtUtc);
    }

    [Fact]
    public async Task UnavailableMode_FailsClosedWithoutFabricatingEnrollment()
    {
        var provider = new SelfDeclaredInstitutionalEnrollmentProvider(
            new InstitutionalEnrollmentOptions(InstitutionalEnrollmentOptions.UnavailableMode));

        InstitutionalEnrollmentResult result = await provider.GetEnrollmentAsync(
            new InstitutionalIdentity(
                ServiceTestData.StudentUserId,
                "student@itbeltran.com.ar"));

        Assert.Equal(InstitutionalEnrollmentStatus.Unavailable, result.Status);
        Assert.Equal(InstitutionalEnrollmentSource.SelfDeclared, result.Source);
        Assert.False(result.IsAuthoritative);
        Assert.Null(result.CareerCode);
        Assert.Empty(result.SubjectCodes);
    }

    [Fact]
    public async Task Provider_PropagatesCancellation()
    {
        var provider = new SelfDeclaredInstitutionalEnrollmentProvider(
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
