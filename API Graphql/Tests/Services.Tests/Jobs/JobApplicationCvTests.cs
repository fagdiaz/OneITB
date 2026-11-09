using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Jobs;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Jobs;

public sealed class JobApplicationCvTests
{
    private static readonly Guid Applicant = ServiceTestData.StudentUserId;
    private static readonly Guid Owner = Guid.NewGuid();
    private static readonly Guid Stranger = Guid.NewGuid();

    private static async Task<JobOffer> SeedAsync(OneItbContext db)
    {
        await ServiceTestData.SeedAcademicGraphAsync(db);
        foreach (var id in new[] { Owner, Stranger })
        {
            var user = ServiceTestData.CreateUser(id, "Luz", "Empleadora", "Empleador", true);
            db.Accounts.Add(ServiceTestData.CreateAccount(user, $"{id:N}@example.test"));
        }
        var offer = new JobOffer { Id = Guid.NewGuid(), EmployerId = Owner, Title = "Desarrollo" };
        db.JobOffers.Add(offer);
        var applicant = await db.Users.SingleAsync(u => u.Id == Applicant);
        applicant.Biography = "Resumen original";
        applicant.IsPublicProfile = false;
        db.UserCvSkills.Add(new UserCvSkill { UserId = Applicant, Name = "Oculto", IsHidden = true });
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();
        return offer;
    }

    [Fact]
    public async Task CapturesReviewedVersionOnceAndRestrictsReadToApplicantAndOfferOwner()
    {
        await using var db = ServiceTestData.CreateContext();
        var offer = await SeedAsync(db);
        var jobs = new JobService(db);
        var preview = await jobs.GetMyApplicationCvPreviewAsync(Applicant, "Estudiante", default);
        Assert.True(preview.CanSubmit);
        var saved = await jobs.ApplyWithCvAsync(Applicant, "Estudiante", offer.Id, preview.Version, default);

        var user = await db.Users.SingleAsync(u => u.Id == Applicant);
        user.Biography = "Edición posterior";
        await db.SaveChangesAsync();
        var repeated = await jobs.ApplyWithCvAsync(Applicant, "Estudiante", offer.Id, preview.Version, default);
        Assert.Equal(saved.Application, repeated.Application);
        Assert.Null(repeated.NotificationId);
        Assert.Single(db.JobApplications);
        Assert.Single(db.JobApplicationCvs);
        Assert.Single(db.Notifications);
        Assert.Equal(saved.NotificationId, db.Notifications.Single().Id);
        foreach (var reader in new[] { Owner, Applicant })
        {
            var delivered = await jobs.GetApplicationCvAsync(reader, saved.Application.Id, default);
            Assert.Equal("Resumen original", delivered!.Summary);
            Assert.Empty(delivered.Skills);
        }
        foreach (var reader in new[] { Stranger, ServiceTestData.AdminUserId, ServiceTestData.OtherStudentUserId })
            await Assert.ThrowsAsync<ApplicationCvException>(() => jobs.GetApplicationCvAsync(reader, saved.Application.Id, default));
    }

    [Fact]
    public async Task StaleIncompleteClosedAndWrongRoleProduceNoRows()
    {
        await using var db = ServiceTestData.CreateContext();
        var offer = await SeedAsync(db);
        var jobs = new JobService(db);
        var preview = await jobs.GetMyApplicationCvPreviewAsync(Applicant, "Estudiante", default);
        var user = await db.Users.SingleAsync(u => u.Id == Applicant);
        user.Biography = null;
        await db.SaveChangesAsync();
        var conflict = await Assert.ThrowsAsync<ApplicationCvException>(() =>
            jobs.ApplyWithCvAsync(Applicant, "Estudiante", offer.Id, preview.Version, default));
        Assert.Equal("CV_VERSION_CHANGED", conflict.Code);
        var incomplete = await jobs.GetMyApplicationCvPreviewAsync(Applicant, "Estudiante", default);
        Assert.False(incomplete.CanSubmit);
        await Assert.ThrowsAsync<ApplicationCvException>(() =>
            jobs.ApplyWithCvAsync(Applicant, "Estudiante", offer.Id, incomplete.Version, default));
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            jobs.ApplyWithCvAsync(Applicant, "Empleador", offer.Id, preview.Version, default));
        user.Biography = "Resumen original";
        (await db.JobOffers.SingleAsync()).IsActive = false;
        await db.SaveChangesAsync();
        await Assert.ThrowsAsync<ApplicationCvException>(() =>
            jobs.ApplyWithCvAsync(Applicant, "Estudiante", offer.Id, preview.Version, default));
        Assert.Empty(db.JobApplications);
        Assert.Empty(db.JobApplicationCvs);
        Assert.Empty(db.Notifications);
    }

    [Fact]
    public async Task HistoricalApplicationHasNoCaptureOnlyForAuthorizedReaders()
    {
        await using var db = ServiceTestData.CreateContext();
        var offer = await SeedAsync(db);
        var jobs = new JobService(db);
        var legacy = await jobs.ApplyToJobAsync(Applicant, "Estudiante", offer.Id);
        Assert.Null(await jobs.GetApplicationCvAsync(Owner, legacy.Id, default));
        await Assert.ThrowsAsync<ApplicationCvException>(() => jobs.GetApplicationCvAsync(Stranger, legacy.Id, default));
        var preview = await jobs.GetMyApplicationCvPreviewAsync(Applicant, "Estudiante", default);
        await Assert.ThrowsAsync<ApplicationCvException>(() =>
            jobs.ApplyWithCvAsync(Applicant, "Estudiante", offer.Id, preview.Version, default));
        Assert.Empty(db.JobApplicationCvs);
    }
}
