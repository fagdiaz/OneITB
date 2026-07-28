using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;

namespace Services.Jobs
{
    public sealed class JobService : IJobService
    {
        private const int MaxTitleLength = 180;
        private const int MaxCompanyLength = 160;
        private const int MaxDescriptionLength = 2000;
        private const int MaxLocationLength = 160;

        private readonly OneItbContext _context;

        public JobService(OneItbContext context)
        {
            _context = context;
        }

        public IQueryable<JobOffer> GetJobOffers(bool onlyActive, Guid? currentUserId)
        {
            IQueryable<JobOffer> query = JobOfferGraph(currentUserId);

            if (onlyActive)
                query = query.Where(offer => offer.IsActive);

            return query
                .OrderByDescending(offer => offer.CreatedAt)
                .ThenByDescending(offer => offer.Id);
        }

        public IQueryable<JobOffer> GetMyJobOffers(Guid employerId, string? employerRole)
        {
            EnsureCanCreateJobOffer(employerRole);

            return JobOfferGraph(includeAllApplications: true)
                .Where(offer => offer.EmployerId == employerId)
                .OrderByDescending(offer => offer.CreatedAt)
                .ThenByDescending(offer => offer.Id);
        }

        public async Task<JobOffer> CreateJobOfferAsync(
            Guid employerId,
            string? employerRole,
            string title,
            string company,
            string description,
            string location,
            CancellationToken cancellationToken = default)
        {
            EnsureCanCreateJobOffer(employerRole);

            User employer = await _context.Users
                .Include(user => user.Account)
                .SingleOrDefaultAsync(user => user.Id == employerId && user.IsActive, cancellationToken)
                ?? throw new InvalidOperationException("Usuario empleador no encontrado o inactivo.");

            var jobOffer = new JobOffer
            {
                Id = Guid.NewGuid(),
                EmployerId = employer.Id,
                Title = NormalizeRequired(title, MaxTitleLength, "titulo"),
                Company = NormalizeRequired(company, MaxCompanyLength, "empresa"),
                Description = NormalizeRequired(description, MaxDescriptionLength, "descripcion"),
                Location = NormalizeRequired(location, MaxLocationLength, "ubicacion"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.JobOffers.Add(jobOffer);
            await _context.SaveChangesAsync(cancellationToken);

            return await JobOfferGraph()
                .SingleAsync(offer => offer.Id == jobOffer.Id, cancellationToken);
        }

        public async Task<JobApplication> ApplyToJobAsync(
            Guid applicantId,
            string? applicantRole,
            Guid jobOfferId,
            CancellationToken cancellationToken = default)
        {
            EnsureCanApplyToJob(applicantRole);

            bool applicantExists = await _context.Users
                .AsNoTracking()
                .AnyAsync(user => user.Id == applicantId && user.IsActive, cancellationToken);
            if (!applicantExists)
                throw new InvalidOperationException("Usuario postulante no encontrado o inactivo.");

            JobOffer offer = await _context.JobOffers
                .AsNoTracking()
                .SingleOrDefaultAsync(item => item.Id == jobOfferId && item.IsActive, cancellationToken)
                ?? throw new InvalidOperationException("La oferta laboral no existe o no esta activa.");

            JobApplication? existing = await JobApplicationGraph()
                .SingleOrDefaultAsync(item => item.JobOfferId == jobOfferId && item.ApplicantId == applicantId, cancellationToken);
            if (existing is not null)
                throw new InvalidOperationException("Ya estas postulado a esta oferta laboral.");

            var application = new JobApplication
            {
                Id = Guid.NewGuid(),
                JobOfferId = offer.Id,
                ApplicantId = applicantId,
                AppliedAt = DateTime.UtcNow,
                Status = JobApplicationStatus.Pending
            };

            _context.JobApplications.Add(application);
            await _context.SaveChangesAsync(cancellationToken);

            return await JobApplicationGraph()
                .SingleAsync(item => item.Id == application.Id, cancellationToken);
        }

        public async Task<JobApplication> UpdateApplicationStatusAsync(
            Guid actorId,
            string? actorRole,
            Guid applicationId,
            JobApplicationStatus status,
            CancellationToken cancellationToken = default)
        {
            EnsureCanCreateJobOffer(actorRole);

            JobApplication application = await _context.JobApplications
                .Include(item => item.JobOffer)
                .SingleOrDefaultAsync(item => item.Id == applicationId, cancellationToken)
                ?? throw new InvalidOperationException("Postulacion no encontrada.");

            if (application.JobOffer.EmployerId != actorId)
                throw new InvalidOperationException("Solo el creador de la oferta puede modificar el estado de esta postulacion.");

            application.Status = status;
            await _context.SaveChangesAsync(cancellationToken);

            return await JobApplicationGraph()
                .SingleAsync(item => item.Id == application.Id, cancellationToken);
        }

        public async Task<Guid[]> GetJobNotificationRecipientIdsAsync(
            Guid excludedUserId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .AsNoTracking()
                .Where(user => user.IsActive && user.Id != excludedUserId)
                .Select(user => user.Id)
                .ToArrayAsync(cancellationToken);
        }

        private IQueryable<JobOffer> JobOfferGraph(
            Guid? currentUserId = null,
            bool includeAllApplications = false)
        {
            IQueryable<JobOffer> query = _context.JobOffers
                .AsNoTracking()
                .Include(offer => offer.Employer)
                .ThenInclude(employer => employer.Account)
                .AsSplitQuery();

            if (includeAllApplications)
            {
                query = query
                    .Include(offer => offer.Applications)
                    .ThenInclude(application => application.Applicant)
                    .ThenInclude(applicant => applicant.Account)
                    .AsSplitQuery();
            }
            else if (currentUserId.HasValue)
            {
                Guid userId = currentUserId.Value;
                query = query
                    .Include(offer => offer.Applications.Where(application => application.ApplicantId == userId))
                    .ThenInclude(application => application.Applicant)
                    .ThenInclude(applicant => applicant.Account)
                    .AsSplitQuery();
            }

            return query;
        }

        private IQueryable<JobApplication> JobApplicationGraph()
        {
            return _context.JobApplications
                .AsNoTracking()
                .Include(application => application.JobOffer)
                .ThenInclude(offer => offer.Employer)
                .ThenInclude(employer => employer.Account)
                .Include(application => application.Applicant)
                .ThenInclude(applicant => applicant.Account)
                .Include(application => application.Applicant)
                .ThenInclude(applicant => applicant.UserCareers)
                .ThenInclude(link => link.Career)
                .Include(application => application.Applicant)
                .ThenInclude(applicant => applicant.CvExperiences)
                .Include(application => application.Applicant)
                .ThenInclude(applicant => applicant.CvEducations)
                .Include(application => application.Applicant)
                .ThenInclude(applicant => applicant.CvSkills)
                .AsSplitQuery();
        }

        private static void EnsureCanCreateJobOffer(string? role)
        {
            if (string.Equals(role, "Administrador", StringComparison.Ordinal) ||
                string.Equals(role, "Empleador", StringComparison.Ordinal))
            {
                return;
            }

            throw new InvalidOperationException("Solo empleadores o administradores pueden publicar ofertas laborales.");
        }

        private static void EnsureCanApplyToJob(string? role)
        {
            if (string.Equals(role, "Estudiante", StringComparison.Ordinal) ||
                string.Equals(role, "Egresado", StringComparison.Ordinal))
            {
                return;
            }

            throw new InvalidOperationException("Solo estudiantes o egresados pueden postularse a ofertas laborales.");
        }

        private static string NormalizeRequired(string? value, int maxLength, string fieldName)
        {
            string normalized = value?.Trim() ?? string.Empty;

            if (normalized.Length == 0)
                throw new ArgumentException($"El campo {fieldName} es obligatorio.");

            if (normalized.Length > maxLength)
                throw new ArgumentException($"El campo {fieldName} no puede superar {maxLength} caracteres.");

            return normalized;
        }
    }
}
