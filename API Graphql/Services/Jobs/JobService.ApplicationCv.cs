using System.Data;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Notifications;

namespace Services.Jobs;

public sealed partial class JobService
{
    private static async Task<CapturedApplicationCv> CaptureAsync(OneItbContext db, Guid actorId, CancellationToken ct)
    {
        var applicant = await db.Users.AsNoTracking().AsSplitQuery()
            .Include(u => u.Account)
            .Include(u => u.UserCareers).ThenInclude(link => link.Career)
            .Include(u => u.CvExperiences).Include(u => u.CvEducations).Include(u => u.CvProjects)
            .Include(u => u.CvSkills).Include(u => u.CvLanguages)
            .SingleOrDefaultAsync(u => u.Id == actorId && u.IsActive &&
                (u.Role == "Estudiante" || u.Role == "Egresado"), ct)
            ?? throw new ApplicationCvException("No puedes postularte con esta cuenta.");
        return CapturedApplicationCv.From(applicant);
    }

    public async Task<ApplicationCvPreview> GetMyApplicationCvPreviewAsync(Guid actorId, string? role, CancellationToken cancellationToken)
    {
        EnsureCanApplyToJob(role);
        var capture = await CaptureAsync(_context, actorId, cancellationToken);
        var cv = CapturedApplicationCv.Read(capture.Json);
        return new ApplicationCvPreview(capture.Version, cv, cv.HasProfessionalContent());
    }

    public async Task<ApplicationCv?> GetApplicationCvAsync(Guid actorId, Guid applicationId, CancellationToken cancellationToken)
    {
        var row = await _context.JobApplications.AsNoTracking()
            .Where(a => a.Id == applicationId && ((a.ApplicantId == actorId && a.Applicant.IsActive) ||
                (a.JobOffer.EmployerId == actorId && a.JobOffer.Employer.IsActive &&
                 (a.JobOffer.Employer.Role == "Empleador" || a.JobOffer.Employer.Role == "Administrador"))))
            .Select(a => new { Json = _context.JobApplicationCvs.Where(cv => cv.ApplicationId == a.Id)
                .Select(cv => cv.PayloadJson).SingleOrDefault() })
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new ApplicationCvException("La postulación no está disponible.");
        return row.Json is null ? null : CapturedApplicationCv.Read(row.Json);
    }

    public async Task<(ApplicationSummary Application, Guid? NotificationId)> ApplyWithCvAsync(
        Guid actorId, string? role, Guid jobOfferId, string expectedCvVersion, CancellationToken cancellationToken)
    {
        EnsureCanApplyToJob(role);
        if (expectedCvVersion?.Length != 64 || !expectedCvVersion.All(Uri.IsHexDigit))
            throw new ApplicationCvException("La versión del CV no es válida.");

        if (!_context.Database.IsSqlServer())
            return await StoreApplicationAsync(_context, actorId, jobOfferId, expectedCvVersion, cancellationToken);

        // Independent tracking on each retry, including a retry after an uncertain commit.
        var strategy = new SqlServerRetryingExecutionStrategy(_context, 3, TimeSpan.FromSeconds(2), new[] { 1205 });
        return await strategy.ExecuteAsync(async ct =>
        {
            await using var db = await _contextFactory!.CreateDbContextAsync(ct);
            await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
            var result = await StoreApplicationAsync(db, actorId, jobOfferId, expectedCvVersion, ct);
            await transaction.CommitAsync(ct);
            return result;
        }, cancellationToken);
    }

    private static async Task<(ApplicationSummary Application, Guid? NotificationId)> StoreApplicationAsync(
        OneItbContext db, Guid actorId, Guid offerId, string version, CancellationToken ct)
    {
        var capture = await CaptureAsync(db, actorId, ct);
        var existing = await db.JobApplications.AsNoTracking()
            .Where(a => a.ApplicantId == actorId && a.JobOfferId == offerId)
            .Select(a => new { Summary = new ApplicationSummary(a.Id, a.JobOfferId, a.Status, a.AppliedAt),
                Json = db.JobApplicationCvs.Where(cv => cv.ApplicationId == a.Id).Select(cv => cv.PayloadJson).SingleOrDefault() })
            .SingleOrDefaultAsync(ct);
        if (existing is not null)
        {
            if (existing.Json is not null && CapturedApplicationCv.VersionOf(existing.Json) == version)
                return (existing.Summary, null);
            throw new ApplicationCvException("Ya existe una postulación para esta oferta.");
        }

        var offer = await db.JobOffers.AsNoTracking().Where(o => o.Id == offerId && o.IsActive)
            .Select(o => new { o.EmployerId, o.Title }).SingleOrDefaultAsync(ct)
            ?? throw new ApplicationCvException("La oferta no está disponible.");
        var cv = CapturedApplicationCv.Read(capture.Json);
        if (capture.Version != version)
            throw new ApplicationCvException("El CV cambió. Revisa la vista previa antes de confirmar.", "CV_VERSION_CHANGED");
        if (!cv.HasProfessionalContent())
            throw new ApplicationCvException("Completa tu perfil profesional antes de postularte.");

        var application = new JobApplication { Id = Guid.NewGuid(), ApplicantId = actorId, JobOfferId = offerId,
            AppliedAt = DateTime.UtcNow, Status = JobApplicationStatus.Pending };
        db.JobApplications.Add(application);
        db.JobApplicationCvs.Add(new JobApplicationCv { ApplicationId = application.Id, SchemaVersion = cv.SchemaVersion,
            CapturedAtUtc = application.AppliedAt, PayloadJson = capture.Json });
        var notices = await NotificationService.PrepareNotificationsAsync(db, new[] { offer.EmployerId },
            NotificationType.JobApplication, $"{cv.Name} se postuló a {offer.Title}.", $"/empleos/mis-ofertas?applicationId={application.Id:D}&offerId={offerId:D}", ct);
        db.Notifications.AddRange(notices);
        await db.SaveChangesAsync(ct);
        return (new ApplicationSummary(application.Id, offerId, application.Status, application.AppliedAt), notices.SingleOrDefault()?.Id);
    }
}
