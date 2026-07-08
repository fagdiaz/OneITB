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

        public IQueryable<JobOffer> GetJobOffers(bool onlyActive)
        {
            IQueryable<JobOffer> query = JobOfferGraph();

            if (onlyActive)
                query = query.Where(offer => offer.IsActive);

            return query
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

        private IQueryable<JobOffer> JobOfferGraph()
        {
            return _context.JobOffers
                .AsNoTracking()
                .Include(offer => offer.Employer)
                .ThenInclude(employer => employer.Account)
                .AsSplitQuery();
        }

        private static void EnsureCanCreateJobOffer(string? role)
        {
            if (string.Equals(role, "Administrador", StringComparison.Ordinal) ||
                string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(role, "Empleador", StringComparison.Ordinal) ||
                string.Equals(role, "Employer", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            throw new InvalidOperationException("Solo empleadores o administradores pueden publicar ofertas laborales.");
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
