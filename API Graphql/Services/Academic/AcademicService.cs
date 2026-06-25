using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;

namespace Services.Academic
{
    public sealed class AcademicService : IAcademicService
    {
        private const string ResourceTypeFile = "File";
        private const string ResourceTypeLink = "Link";
        private const string ResourceTypeMixed = "Mixed";

        private readonly OneItbContext _context;

        public AcademicService(OneItbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<AcademicResource>> GetAcademicResourcesAsync(Guid actorUserId, string? actorRole, int subjectId)
        {
            Subject subject = await LoadActiveSubjectAsync(subjectId);
            await EnsureCanViewSubjectAsync(actorUserId, actorRole, subject.CareerId);

            return await ResourceGraph()
                .Where(resource => resource.SubjectId == subjectId)
                .OrderByDescending(resource => resource.CreatedAt)
                .ThenBy(resource => resource.Title)
                .ToListAsync();
        }

        public async Task<AcademicResource> AddAcademicResourceAsync(
            Guid actorUserId,
            string? actorRole,
            int subjectId,
            string title,
            string? description,
            string? fileUrl,
            string? externalUrl)
        {
            EnsureCanManageAcademics(actorRole);
            await EnsureActiveUserAsync(actorUserId);
            await LoadActiveSubjectAsync(subjectId);

            string normalizedTitle = RequireText(title, 200, "El titulo");
            string? normalizedDescription = OptionalText(description, 1000, "La descripcion");
            string? normalizedFileUrl = NormalizeFileUrl(fileUrl);
            string? normalizedExternalUrl = NormalizeExternalUrl(externalUrl);

            if (normalizedFileUrl is null && normalizedExternalUrl is null)
                throw new InvalidOperationException("El recurso debe incluir un archivo o un enlace externo.");

            var resource = new AcademicResource
            {
                Id = Guid.NewGuid(),
                SubjectId = subjectId,
                UploaderId = actorUserId,
                Title = normalizedTitle,
                Description = normalizedDescription,
                FileUrl = normalizedFileUrl,
                ExternalUrl = normalizedExternalUrl,
                ResourceType = DetermineResourceType(normalizedFileUrl, normalizedExternalUrl),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.AcademicResources.Add(resource);
            await _context.SaveChangesAsync();
            return await LoadResourceGraphAsync(resource.Id);
        }

        public async Task<AcademicResource> ToggleAcademicResourceStatusAsync(Guid actorUserId, string? actorRole, Guid resourceId)
        {
            EnsureCanManageAcademics(actorRole);
            await EnsureActiveUserAsync(actorUserId);

            AcademicResource resource = await _context.AcademicResources
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(item => item.Id == resourceId)
                ?? throw new InvalidOperationException("Recurso academico no encontrado.");

            resource.IsActive = !resource.IsActive;
            resource.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return await LoadResourceGraphAsync(resource.Id, ignoreFilters: true);
        }

        public async Task<IReadOnlyList<AcademicProgress>> GetMyAcademicProgressAsync(Guid actorUserId)
        {
            await EnsureActiveUserAsync(actorUserId);

            return await ProgressGraph()
                .Where(progress => progress.UserId == actorUserId)
                .OrderBy(progress => progress.Subject.Career.Name)
                .ThenBy(progress => progress.Subject.Name)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<AcademicProgress>> GetAcademicProgressForUserAsync(Guid actorUserId, string? actorRole, Guid userId)
        {
            EnsureAdmin(actorRole);
            await EnsureActiveUserAsync(actorUserId);
            await EnsureActiveUserAsync(userId);

            return await ProgressGraph()
                .Where(progress => progress.UserId == userId)
                .OrderBy(progress => progress.Subject.Career.Name)
                .ThenBy(progress => progress.Subject.Name)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<User>> GetAcademicStudentsAsync(Guid actorUserId, string? actorRole, int subjectId)
        {
            EnsureCanManageAcademics(actorRole);
            await EnsureActiveUserAsync(actorUserId);
            Subject subject = await LoadActiveSubjectAsync(subjectId);

            return await _context.UserCareers
                .AsNoTracking()
                .Where(link =>
                    link.CareerId == subject.CareerId &&
                    link.User.IsActive &&
                    link.User.Role == "Estudiante")
                .Select(link => link.User)
                .OrderBy(user => user.LastName)
                .ThenBy(user => user.FirstName)
                .ToListAsync();
        }

        public async Task<AcademicProgress> UpsertAcademicProgressAsync(
            Guid actorUserId,
            string? actorRole,
            Guid userId,
            int subjectId,
            decimal? score,
            AcademicProgressStatus status,
            string? notes)
        {
            EnsureCanManageAcademics(actorRole);
            await EnsureActiveUserAsync(actorUserId);

            User targetUser = await _context.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(user => user.Id == userId && user.IsActive)
                ?? throw new InvalidOperationException("Usuario objetivo no encontrado o inactivo.");

            if (!string.Equals(targetUser.Role, "Estudiante", StringComparison.Ordinal))
                throw new InvalidOperationException("Solo se puede cargar progreso academico para estudiantes.");

            Subject subject = await LoadActiveSubjectAsync(subjectId);
            bool belongsToCareer = await _context.UserCareers
                .AnyAsync(link => link.UserId == userId && link.CareerId == subject.CareerId);
            if (!belongsToCareer)
                throw new InvalidOperationException("El estudiante no pertenece a la carrera de la materia seleccionada.");

            decimal? normalizedScore = ValidateScore(score);
            string? normalizedNotes = OptionalText(notes, 1000, "Las observaciones");

            AcademicProgress? progress = await _context.AcademicProgressRecords
                .SingleOrDefaultAsync(item => item.UserId == userId && item.SubjectId == subjectId);

            if (progress is null)
            {
                progress = new AcademicProgress
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    SubjectId = subjectId,
                    AssignedById = actorUserId,
                    Score = normalizedScore,
                    Status = status,
                    Notes = normalizedNotes,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.AcademicProgressRecords.Add(progress);
            }
            else
            {
                progress.AssignedById = actorUserId;
                progress.Score = normalizedScore;
                progress.Status = status;
                progress.Notes = normalizedNotes;
                progress.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return await LoadProgressGraphAsync(progress.Id);
        }

        private IQueryable<AcademicResource> ResourceGraph(bool ignoreFilters = false)
        {
            IQueryable<AcademicResource> query = _context.AcademicResources;
            if (ignoreFilters)
                query = query.IgnoreQueryFilters();

            return query
                .AsNoTracking()
                .Include(resource => resource.Subject)
                .ThenInclude(subject => subject.Career)
                .Include(resource => resource.Uploader);
        }

        private IQueryable<AcademicProgress> ProgressGraph()
        {
            return _context.AcademicProgressRecords
                .AsNoTracking()
                .Include(progress => progress.User)
                .Include(progress => progress.AssignedBy)
                .Include(progress => progress.Subject)
                .ThenInclude(subject => subject.Career);
        }

        private async Task<AcademicResource> LoadResourceGraphAsync(Guid resourceId, bool ignoreFilters = false)
        {
            return await ResourceGraph(ignoreFilters)
                .SingleOrDefaultAsync(resource => resource.Id == resourceId)
                ?? throw new InvalidOperationException("Recurso academico no encontrado.");
        }

        private async Task<AcademicProgress> LoadProgressGraphAsync(Guid progressId)
        {
            return await ProgressGraph()
                .SingleOrDefaultAsync(progress => progress.Id == progressId)
                ?? throw new InvalidOperationException("Progreso academico no encontrado.");
        }

        private async Task<Subject> LoadActiveSubjectAsync(int subjectId)
        {
            return await _context.Subjects
                .AsNoTracking()
                .Include(subject => subject.Career)
                .SingleOrDefaultAsync(subject => subject.Id == subjectId && subject.IsActive && subject.Career.IsActive)
                ?? throw new InvalidOperationException("Materia no encontrada o inactiva.");
        }

        private async Task EnsureCanViewSubjectAsync(Guid actorUserId, string? actorRole, int careerId)
        {
            if (CanManageAcademics(actorRole))
                return;

            bool belongsToCareer = await _context.UserCareers
                .AnyAsync(link => link.UserId == actorUserId && link.CareerId == careerId);
            if (!belongsToCareer)
                throw new InvalidOperationException("No tenes acceso a los recursos de esta materia.");
        }

        private async Task EnsureActiveUserAsync(Guid userId)
        {
            bool exists = await _context.Users.AnyAsync(user => user.Id == userId && user.IsActive);
            if (!exists)
                throw new InvalidOperationException("Usuario no encontrado o inactivo.");
        }

        private static void EnsureCanManageAcademics(string? role)
        {
            if (!CanManageAcademics(role))
                throw new InvalidOperationException("No tenes permisos para gestionar contenido academico.");
        }

        private static void EnsureAdmin(string? role)
        {
            if (!string.Equals(role, "Administrador", StringComparison.Ordinal))
                throw new InvalidOperationException("La consulta requiere rol Administrador.");
        }

        private static bool CanManageAcademics(string? role)
        {
            return string.Equals(role, "Administrador", StringComparison.Ordinal) ||
                   string.Equals(role, "Profesor", StringComparison.Ordinal);
        }

        private static string RequireText(string value, int maxLength, string fieldName)
        {
            string normalized = value?.Trim() ?? string.Empty;
            if (normalized.Length == 0)
                throw new ArgumentException($"{fieldName} es obligatorio.");
            if (normalized.Length > maxLength)
                throw new ArgumentException($"{fieldName} no puede superar {maxLength} caracteres.");
            return normalized;
        }

        private static string? OptionalText(string? value, int maxLength, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            string normalized = value.Trim();
            if (normalized.Length > maxLength)
                throw new ArgumentException($"{fieldName} no puede superar {maxLength} caracteres.");
            return normalized;
        }

        private static string? NormalizeFileUrl(string? fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
                return null;

            string normalized = fileUrl.Trim();
            if (normalized.Length > 500 ||
                !normalized.StartsWith("/uploads/", StringComparison.Ordinal) ||
                normalized.Contains("..", StringComparison.Ordinal))
            {
                throw new InvalidOperationException("La URL del archivo academico no es valida.");
            }

            return normalized;
        }

        private static string? NormalizeExternalUrl(string? externalUrl)
        {
            if (string.IsNullOrWhiteSpace(externalUrl))
                return null;

            string normalized = externalUrl.Trim();
            if (normalized.Length > 500 ||
                !Uri.TryCreate(normalized, UriKind.Absolute, out Uri? parsed) ||
                (parsed.Scheme != Uri.UriSchemeHttp && parsed.Scheme != Uri.UriSchemeHttps))
            {
                throw new InvalidOperationException("El enlace externo debe ser una URL http o https valida.");
            }

            return normalized;
        }

        private static string DetermineResourceType(string? fileUrl, string? externalUrl)
        {
            return fileUrl is not null && externalUrl is not null
                ? ResourceTypeMixed
                : fileUrl is not null
                    ? ResourceTypeFile
                    : ResourceTypeLink;
        }

        private static decimal? ValidateScore(decimal? score)
        {
            if (!score.HasValue)
                return null;

            decimal normalized = Math.Round(score.Value, 2, MidpointRounding.AwayFromZero);
            if (normalized < 0 || normalized > 10)
                throw new ArgumentException("La calificacion debe estar entre 0 y 10.");

            return normalized;
        }
    }
}
