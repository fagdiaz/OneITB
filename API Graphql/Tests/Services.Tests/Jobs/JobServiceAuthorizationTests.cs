using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;
using Services.Jobs;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Jobs;

public sealed class JobServiceAuthorizationTests
{
    [Fact]
    public async Task UpdateApplicationStatusAsync_RejectsAllowedRoleThatDoesNotOwnOffer()
    {
        await using var context = ServiceTestData.CreateContext();
        User owner = ServiceTestData.CreateUser(Guid.NewGuid(), "Empresa", "Uno", "Empleador", true);
        User otherEmployer = ServiceTestData.CreateUser(Guid.NewGuid(), "Empresa", "Dos", "Empleador", true);
        User applicant = ServiceTestData.CreateUser(Guid.NewGuid(), "Alumno", "Postulante", "Estudiante", true);
        context.Accounts.AddRange(
            ServiceTestData.CreateAccount(owner, "owner@itbeltran.test"),
            ServiceTestData.CreateAccount(otherEmployer, "other.employer@itbeltran.test"),
            ServiceTestData.CreateAccount(applicant, "applicant@itbeltran.test"));

        var offer = new JobOffer
        {
            Id = Guid.NewGuid(),
            EmployerId = owner.Id,
            Title = "Desarrollador junior",
            Company = "Empresa Uno",
            Description = "Primera experiencia profesional.",
            Location = "Avellaneda",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        var application = new JobApplication
        {
            Id = Guid.NewGuid(),
            JobOfferId = offer.Id,
            ApplicantId = applicant.Id,
            AppliedAt = DateTime.UtcNow,
            Status = JobApplicationStatus.Pending
        };
        context.JobOffers.Add(offer);
        context.JobApplications.Add(application);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var service = new JobService(context);
        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpdateApplicationStatusAsync(
                otherEmployer.Id,
                "Empleador",
                application.Id,
                JobApplicationStatus.Reviewed));

        Assert.Contains("creador", exception.Message, StringComparison.OrdinalIgnoreCase);
        JobApplication persisted = await context.JobApplications
            .AsNoTracking()
            .SingleAsync(item => item.Id == application.Id);
        Assert.Equal(JobApplicationStatus.Pending, persisted.Status);
    }

    [Theory]
    [InlineData("Employer")]
    [InlineData("Admin")]
    [InlineData("Student")]
    [InlineData("Graduate")]
    public async Task CanonicalRoleChecks_RejectLegacyEnglishAliases(string role)
    {
        await using var context = ServiceTestData.CreateContext();
        var service = new JobService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateJobOfferAsync(
                Guid.NewGuid(),
                role,
                "Oferta",
                "Empresa",
                "Descripcion",
                "Ubicacion"));
    }
}
