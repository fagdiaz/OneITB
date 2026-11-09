using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Notifications;
using Services.Pagination;
using Services.Siu;

namespace Services.Academic
{
    public sealed class AcademicService : IAcademicService
    {
        private const string ResourceTypeFile = "File";
        private const string ResourceTypeLink = "Link";
        private const string ResourceTypeMixed = "Mixed";

        private readonly OneItbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ISiuIntegrationService _siuIntegrationService;

        public AcademicService(
            OneItbContext context,
            INotificationService notificationService,
            ISiuIntegrationService siuIntegrationService)
        {
            _context = context;
            _notificationService = notificationService;
            _siuIntegrationService = siuIntegrationService;
        }

        public async Task<IReadOnlyList<AcademicResource>> GetAcademicResourcesAsync(
            Guid actorUserId,
            string? actorRole,
            int subjectId,
            string? searchTerm,
            AcademicResourceCategory? category,
            CancellationToken cancellationToken = default)
        {
            Subject subject = await LoadActiveSubjectAsync(subjectId, cancellationToken);
            await EnsureCanViewSubjectAsync(actorUserId, actorRole, subject.CareerId, cancellationToken);

            string? normalizedSearch = OptionalText(searchTerm, 120, "La busqueda");
            IQueryable<AcademicResource> query = ResourceGraph()
                .Where(resource => resource.SubjectId == subjectId);

            if (category.HasValue)
                query = query.Where(resource => resource.Category == category.Value);

            if (normalizedSearch is not null)
            {
                query = query.Where(resource =>
                    resource.Title.Contains(normalizedSearch) ||
                    (resource.Description != null && resource.Description.Contains(normalizedSearch)) ||
                    resource.Uploader.FirstName.Contains(normalizedSearch) ||
                    resource.Uploader.LastName.Contains(normalizedSearch) ||
                    resource.Subject.Name.Contains(normalizedSearch) ||
                    resource.Subject.Code.Contains(normalizedSearch));
            }

            return await query
                .OrderByDescending(resource => resource.CreatedAt)
                .ThenBy(resource => resource.Title)
                .ToListAsync(cancellationToken);
        }

        public async Task<AcademicResource> AddAcademicResourceAsync(
            Guid actorUserId,
            string? actorRole,
            int subjectId,
            string title,
            string? description,
            AcademicResourceCategory? category,
            int? version,
            string? fileUrl,
            string? externalUrl,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveUserAsync(actorUserId, cancellationToken);
            Subject subject = await LoadActiveSubjectAsync(subjectId, cancellationToken);
            await EnsureCanCreateResourceAsync(actorUserId, actorRole, subject.CareerId, cancellationToken);

            string normalizedTitle = RequireText(title, 200, "El titulo");
            string? normalizedDescription = OptionalText(description, 1000, "La descripcion");
            int normalizedVersion = NormalizeVersion(version);
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
                Category = category ?? AcademicResourceCategory.Otro,
                Version = normalizedVersion,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.AcademicResources.Add(resource);
            await _context.SaveChangesAsync(cancellationToken);

            AcademicResource persisted = await LoadResourceGraphAsync(resource.Id, cancellationToken: cancellationToken);
            Guid[] recipients = await GetAcademicAudienceAsync(subject.CareerId, actorUserId, cancellationToken);
            await _notificationService.CreateNotificationsAsync(
                recipients,
                NotificationType.AcademicResource,
                $"Nuevo recurso en {subject.Name}: {persisted.Title}",
                $"/academic?subjectId={subject.Id}&resourceId={persisted.Id:D}",
                cancellationToken);

            return persisted;
        }

        public async Task<AcademicResource> DeleteResourceAsync(
            Guid actorUserId,
            string? actorRole,
            Guid resourceId,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveUserAsync(actorUserId, cancellationToken);

            AcademicResource resource = await _context.AcademicResources
                .IgnoreQueryFilters()
                .Include(item => item.Subject)
                .SingleOrDefaultAsync(item => item.Id == resourceId, cancellationToken)
                ?? throw new InvalidOperationException("Recurso academico no encontrado.");

            await EnsureCanManageSubjectAsync(
                actorUserId,
                actorRole,
                resource.Subject.CareerId,
                cancellationToken);

            resource.IsActive = false;
            resource.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return await LoadResourceGraphAsync(
                resource.Id,
                ignoreFilters: true,
                cancellationToken: cancellationToken);
        }

        public async Task<AcademicResource> ToggleAcademicResourceStatusAsync(
            Guid actorUserId,
            string? actorRole,
            Guid resourceId,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveUserAsync(actorUserId, cancellationToken);

            AcademicResource resource = await _context.AcademicResources
                .IgnoreQueryFilters()
                .Include(item => item.Subject)
                .SingleOrDefaultAsync(item => item.Id == resourceId, cancellationToken)
                ?? throw new InvalidOperationException("Recurso academico no encontrado.");
            await EnsureCanManageSubjectAsync(
                actorUserId,
                actorRole,
                resource.Subject.CareerId,
                cancellationToken);

            resource.IsActive = !resource.IsActive;
            resource.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return await LoadResourceGraphAsync(
                resource.Id,
                ignoreFilters: true,
                cancellationToken: cancellationToken);
        }

        public async Task<IReadOnlyList<AcademicProgress>> GetMyAcademicProgressAsync(
            Guid actorUserId,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveUserAsync(actorUserId, cancellationToken);

            return await ProgressGraph()
                .Where(progress => progress.UserId == actorUserId)
                .OrderBy(progress => progress.Subject.Career.Name)
                .ThenBy(progress => progress.Subject.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<AcademicProgress>> GetAcademicProgressForUserAsync(
            Guid actorUserId,
            string? actorRole,
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            EnsureAdmin(actorRole);
            await EnsureActiveUserAsync(actorUserId, cancellationToken);
            await EnsureActiveUserAsync(userId, cancellationToken);

            return await ProgressGraph()
                .Where(progress => progress.UserId == userId)
                .OrderBy(progress => progress.Subject.Career.Name)
                .ThenBy(progress => progress.Subject.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<AcademicStudentPage> GetAcademicStudentsPageAsync(
            Guid actorUserId,
            string? actorRole,
            int subjectId,
            int first,
            string? after,
            CancellationToken cancellationToken = default)
        {
            int pageSize = Math.Clamp(first, 1, 50);
            int offset = OffsetCursor.Decode(after);
            cancellationToken.ThrowIfCancellationRequested();
            await EnsureActiveUserAsync(actorUserId, cancellationToken);
            Subject subject = await LoadActiveSubjectAsync(subjectId, cancellationToken);
            await EnsureCanManageSubjectAsync(
                actorUserId,
                actorRole,
                subject.CareerId,
                cancellationToken);

            IQueryable<User> query = _context.UserCareers
                .AsNoTracking()
                .Where(link =>
                    link.CareerId == subject.CareerId &&
                    link.User.IsActive &&
                    link.User.Role == "Estudiante")
                .Select(link => link.User)
                .OrderBy(user => user.LastName)
                .ThenBy(user => user.FirstName)
                .ThenBy(user => user.Id);

            int totalCount = await query.CountAsync(cancellationToken);
            List<User> students = await query
                .Skip(offset)
                .Take(pageSize + 1)
                .ToListAsync(cancellationToken);
            bool hasNextPage = students.Count > pageSize;
            if (hasNextPage)
                students.RemoveAt(students.Count - 1);

            return new AcademicStudentPage
            {
                Items = students,
                HasNextPage = hasNextPage,
                NextCursor = hasNextPage ? OffsetCursor.Encode(offset + students.Count) : string.Empty,
                TotalCount = totalCount
            };
        }

        public async Task<AcademicProgress> UpsertAcademicProgressAsync(
            Guid actorUserId,
            string? actorRole,
            Guid userId,
            int subjectId,
            decimal? score,
            AcademicProgressStatus status,
            string? notes,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveUserAsync(actorUserId, cancellationToken);

            User targetUser = await _context.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(user => user.Id == userId && user.IsActive, cancellationToken)
                ?? throw new InvalidOperationException("Usuario objetivo no encontrado o inactivo.");

            if (!string.Equals(targetUser.Role, "Estudiante", StringComparison.Ordinal))
                throw new InvalidOperationException("Solo se puede cargar progreso academico para estudiantes.");

            Subject subject = await LoadActiveSubjectAsync(subjectId, cancellationToken);
            await EnsureCanManageSubjectAsync(
                actorUserId,
                actorRole,
                subject.CareerId,
                cancellationToken);
            bool belongsToCareer = await _context.UserCareers
                .AnyAsync(
                    link => link.UserId == userId && link.CareerId == subject.CareerId,
                    cancellationToken);
            if (!belongsToCareer)
                throw new InvalidOperationException("El estudiante no pertenece a la carrera de la materia seleccionada.");

            decimal? normalizedScore = ValidateScore(score);
            string? normalizedNotes = OptionalText(notes, 1000, "Las observaciones");

            AcademicProgress? progress = await _context.AcademicProgressRecords
                .SingleOrDefaultAsync(
                    item => item.UserId == userId && item.SubjectId == subjectId,
                    cancellationToken);

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

            await _context.SaveChangesAsync(cancellationToken);
            AcademicProgress persisted = await LoadProgressGraphAsync(progress.Id, cancellationToken);
            await NotifyAcademicProgressAsync(userId, persisted.SubjectId, persisted.Subject.Name, persisted.Id, cancellationToken);
            return persisted;
        }

        public async Task<SiuSyncResult> SyncSiuGradesAsync(
            Guid actorUserId,
            string? actorRole,
            int subjectId,
            CancellationToken cancellationToken = default)
        {
            EnsureAdmin(actorRole);
            await EnsureActiveUserAsync(actorUserId, cancellationToken);
            Subject subject = await LoadActiveSubjectAsync(subjectId, cancellationToken);

            IReadOnlyList<SiuGradeRecord> records = await _siuIntegrationService.GetGradesAsync(
                subjectId,
                cancellationToken);
            var skippedItems = new List<string>();

            string[] emails = records
                .Select(record => record.StudentEmail?.Trim())
                .Where(email => !string.IsNullOrWhiteSpace(email))
                .Select(email => NormalizeEmailKey(email!))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            List<Account> accounts = emails.Length == 0
                ? new List<Account>()
                : await _context.Accounts
                    .Include(account => account.User)
                    .Where(account => emails.Contains(account.Email.ToLower()))
                    .ToListAsync(cancellationToken);

            var accountsByEmail = accounts
                .GroupBy(account => NormalizeEmailKey(account.Email), StringComparer.OrdinalIgnoreCase)
                .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

            Guid[] candidateUserIds = accounts
                .Select(account => account.User.Id)
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToArray();

            HashSet<Guid> eligibleUserIds = candidateUserIds.Length == 0
                ? new HashSet<Guid>()
                : (await _context.UserCareers
                    .AsNoTracking()
                    .Where(link => candidateUserIds.Contains(link.UserId) && link.CareerId == subject.CareerId)
                    .Select(link => link.UserId)
                    .ToListAsync(cancellationToken))
                    .ToHashSet();

            Dictionary<Guid, AcademicProgress> progressByUserId = eligibleUserIds.Count == 0
                ? new Dictionary<Guid, AcademicProgress>()
                : await _context.AcademicProgressRecords
                    .Where(progress => eligibleUserIds.Contains(progress.UserId) && progress.SubjectId == subjectId)
                    .ToDictionaryAsync(progress => progress.UserId, cancellationToken);

            int created = 0;
            int updated = 0;
            var notificationUserIds = new HashSet<Guid>();

            foreach (SiuGradeRecord record in records)
            {
                string email = record.StudentEmail?.Trim() ?? string.Empty;
                if (email.Length == 0)
                {
                    skippedItems.Add("Registro sin email.");
                    continue;
                }

                if (!accountsByEmail.TryGetValue(NormalizeEmailKey(email), out Account? account))
                {
                    skippedItems.Add($"{email}: sin cuenta local.");
                    continue;
                }

                User user = account.User;
                if (!user.IsActive || !string.Equals(user.Role, "Estudiante", StringComparison.Ordinal))
                {
                    skippedItems.Add($"{email}: usuario inactivo o no estudiante.");
                    continue;
                }

                if (!eligibleUserIds.Contains(user.Id))
                {
                    skippedItems.Add($"{email}: no pertenece a la carrera de {subject.Name}.");
                    continue;
                }

                decimal? normalizedScore;
                try
                {
                    normalizedScore = ValidateScore(record.Score);
                }
                catch (ArgumentException ex)
                {
                    skippedItems.Add($"{email}: {ex.Message}");
                    continue;
                }

                string? normalizedNotes = OptionalText(record.Notes, 1000, "Las observaciones");

                if (!progressByUserId.TryGetValue(user.Id, out AcademicProgress? progress))
                {
                    progress = new AcademicProgress
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        SubjectId = subjectId,
                        AssignedById = actorUserId
                    };
                    _context.AcademicProgressRecords.Add(progress);
                    progressByUserId[user.Id] = progress;
                    created++;
                }
                else
                {
                    updated++;
                }

                progress.Score = normalizedScore;
                progress.Status = record.Status;
                progress.Notes = normalizedNotes;
                progress.UpdatedAt = DateTime.UtcNow;
                progress.AssignedById = actorUserId;
                notificationUserIds.Add(user.Id);
            }

            if (created + updated > 0)
                await _context.SaveChangesAsync(cancellationToken);

            if (notificationUserIds.Count > 0)
            {
                await _notificationService.CreateNotificationsAsync(
                    notificationUserIds,
                    NotificationType.SiuSync,
                    $"Tus notas de {subject.Name} fueron sincronizadas desde SIU Guarani.",
                    $"/academic?subjectId={subject.Id}",
                    cancellationToken);
            }

            string message = $"Sincronizacion SIU finalizada: {created} altas, {updated} actualizaciones, {skippedItems.Count} omitidos.";
            return new SiuSyncResult(subjectId, records.Count, created, updated, skippedItems.Count, message, skippedItems);
        }

        public async Task<IReadOnlyList<CourseSectionSummary>> GetMyCourseSectionsAsync(
            Guid professorId,
            int subjectId,
            string term,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            await EnsureActiveUserAsync(professorId, cancellationToken);

            IQueryable<CourseSection> query = _context.CourseSections
                .AsNoTracking()
                .Where(cs => cs.Instructors.Any(si => si.ProfessorId == professorId && si.Professor.IsActive));

            if (subjectId > 0)
            {
                query = query.Where(cs => cs.SubjectId == subjectId);
            }

            if (!string.IsNullOrWhiteSpace(term))
            {
                string normTerm = term.Trim();
                query = query.Where(cs => cs.Term == normTerm);
            }

            return await query
                .OrderBy(cs => cs.Subject.Name)
                .ThenBy(cs => cs.Term)
                .ThenBy(cs => cs.Code)
                .Select(cs => new CourseSectionSummary(
                    cs.Id,
                    cs.SubjectId,
                    cs.Term,
                    cs.Code))
                .ToListAsync(cancellationToken);
        }

        public async Task<SectionRosterPage> GetSectionRosterPageAsync(
            Guid callerId,
            string? callerRole,
            Guid sectionId,
            int first,
            string? after,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            await EnsureActiveUserAsync(callerId, cancellationToken);

            CourseSection? section = await _context.CourseSections
                .AsNoTracking()
                .FirstOrDefaultAsync(cs => cs.Id == sectionId, cancellationToken);

            if (section is null)
            {
                throw new InvalidOperationException("La comisión no existe.");
            }

            bool isPrivileged = string.Equals(callerRole, "Administrador", StringComparison.OrdinalIgnoreCase) ||
                                string.Equals(callerRole, "Moderador", StringComparison.OrdinalIgnoreCase);

            if (!isPrivileged)
            {
                bool isInstructor = await _context.SectionInstructors
                    .AnyAsync(si => si.SectionId == sectionId && si.ProfessorId == callerId && si.Professor.IsActive, cancellationToken);

                if (!isInstructor)
                {
                    throw new UnauthorizedAccessException("No tienes permisos para consultar la lista de esta comisión.");
                }
            }

            int pageSize = Math.Clamp(first, 1, 50);
            int offset = OffsetCursor.Decode(after);

            IQueryable<SectionEnrollment> query = _context.SectionEnrollments
                .AsNoTracking()
                .Where(se => se.SectionId == sectionId && se.Student.IsActive)
                .OrderBy(se => se.Student.LastName)
                .ThenBy(se => se.Student.FirstName)
                .ThenBy(se => se.StudentId);

            List<SectionEnrollment> enrollments = await query
                .Include(se => se.Student)
                .Include(se => se.Grade)
                .Skip(offset)
                .Take(pageSize + 1)
                .ToListAsync(cancellationToken);

            bool hasNextPage = enrollments.Count > pageSize;
            if (hasNextPage)
            {
                enrollments.RemoveAt(enrollments.Count - 1);
            }

            List<RosterStudent> items = enrollments.Select(se => new RosterStudent(
                se.StudentId,
                $"{se.Student.FirstName} {se.Student.LastName}".Trim(),
                se.Grade)).ToList();

            string? nextCursor = hasNextPage ? OffsetCursor.Encode(offset + items.Count) : null;
            return new SectionRosterPage(items, nextCursor, hasNextPage);
        }

        public async Task<SectionGrade> SaveSectionGradeAsync(
            Guid professorId,
            string? callerRole,
            SectionGradeInput input,
            CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(input);
            cancellationToken.ThrowIfCancellationRequested();
            await EnsureActiveUserAsync(professorId, cancellationToken);

            CourseSection? section = await _context.CourseSections
                .Include(cs => cs.Subject)
                .FirstOrDefaultAsync(cs => cs.Id == input.SectionId, cancellationToken);

            if (section is null)
            {
                throw new InvalidOperationException("La comisión no existe.");
            }

            bool isPrivileged = string.Equals(callerRole, "Administrador", StringComparison.OrdinalIgnoreCase);
            if (!isPrivileged)
            {
                bool isInstructor = await _context.SectionInstructors
                    .AnyAsync(si => si.SectionId == input.SectionId && si.ProfessorId == professorId && si.Professor.IsActive, cancellationToken);

                if (!isInstructor)
                {
                    throw new InvalidOperationException("El docente no está asignado a esta comisión.");
                }
            }

            bool isEnrolled = await _context.SectionEnrollments
                .AnyAsync(se => se.SectionId == input.SectionId && se.StudentId == input.StudentId, cancellationToken);

            if (!isEnrolled)
            {
                throw new InvalidOperationException("El estudiante no está inscripto en esta comisión.");
            }

            User? student = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == input.StudentId && u.IsActive, cancellationToken);

            if (student is null)
            {
                throw new InvalidOperationException("El estudiante no existe o no está activo.");
            }

            decimal? validatedScore = ValidateScore(input.Score);

            SectionGrade? existingGrade = await _context.SectionGrades
                .FirstOrDefaultAsync(g => g.SectionId == input.SectionId && g.StudentId == input.StudentId, cancellationToken);

            if (existingGrade is not null)
            {
                if (!string.IsNullOrEmpty(input.ExpectedVersion))
                {
                    string currentVersion = existingGrade.RowVersion != null && existingGrade.RowVersion.Length > 0
                        ? Convert.ToBase64String(existingGrade.RowVersion)
                        : string.Empty;

                    if (!string.Equals(currentVersion, input.ExpectedVersion, StringComparison.Ordinal))
                    {
                        throw new InvalidOperationException("Conflicto de concurrencia: la nota fue modificada por otro usuario.");
                    }
                }

                existingGrade.AssignedById = professorId;
                existingGrade.Score = validatedScore;
                existingGrade.Status = input.Status;
                existingGrade.UpdatedAtUtc = DateTime.UtcNow;
                existingGrade.RowVersion = Guid.NewGuid().ToByteArray();
            }
            else
            {
                if (!string.IsNullOrEmpty(input.ExpectedVersion))
                {
                    throw new InvalidOperationException("Conflicto de concurrencia: la nota no existe.");
                }

                existingGrade = new SectionGrade
                {
                    Id = Guid.NewGuid(),
                    SectionId = input.SectionId,
                    StudentId = input.StudentId,
                    AssignedById = professorId,
                    Score = validatedScore,
                    Status = input.Status,
                    UpdatedAtUtc = DateTime.UtcNow,
                    RowVersion = Guid.NewGuid().ToByteArray()
                };
                _context.SectionGrades.Add(existingGrade);
            }

            // Proyección atómica al progreso académico de la materia
            AcademicProgress? progress = await _context.AcademicProgressRecords
                .FirstOrDefaultAsync(ap => ap.UserId == input.StudentId && ap.SubjectId == section.SubjectId, cancellationToken);

            if (progress is null)
            {
                progress = new AcademicProgress
                {
                    Id = Guid.NewGuid(),
                    UserId = input.StudentId,
                    SubjectId = section.SubjectId,
                    AssignedById = professorId,
                    Score = validatedScore,
                    Status = input.Status,
                    Notes = $"Proyectado desde comisión {section.Code} ({section.Term})",
                    UpdatedAt = DateTime.UtcNow
                };
                _context.AcademicProgressRecords.Add(progress);
            }
            else
            {
                progress.AssignedById = professorId;
                progress.Score = validatedScore;
                progress.Status = input.Status;
                progress.Notes = $"Actualizado desde comisión {section.Code} ({section.Term})";
                progress.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);

            if (section.Subject is not null)
            {
                await NotifyAcademicProgressAsync(input.StudentId, section.SubjectId, section.Subject.Name, progress.Id, cancellationToken);
            }

            return existingGrade;
        }

        public async Task<RegularStudentCertificate> IssueRegularStudentCertificateAsync(
            Guid studentId,
            int careerId,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            User? student = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == studentId && u.IsActive, cancellationToken);

            if (student is null)
            {
                throw new InvalidOperationException("El estudiante no existe o no está activo.");
            }

            Career? career = await _context.Careers
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == careerId, cancellationToken);

            if (career is null)
            {
                throw new InvalidOperationException("La carrera no existe.");
            }

            DateTime nowUtc = DateTime.UtcNow;
            EnrollmentStanding? standing = await _context.EnrollmentStandings
                .AsNoTracking()
                .Where(s => s.StudentId == studentId &&
                            s.CareerId == careerId &&
                            s.Status == "Regular" &&
                            s.ValidFromUtc <= nowUtc &&
                            s.ValidUntilUtc >= nowUtc &&
                            s.RevokedAtUtc == null)
                .OrderByDescending(s => s.ValidUntilUtc)
                .FirstOrDefaultAsync(cancellationToken);

            if (standing is null)
            {
                throw new InvalidOperationException("No cuenta con acreditación institucional regular vigente para esta carrera.");
            }

            RegularStudentCertificate? existingCert = await _context.RegularStudentCertificates
                .FirstOrDefaultAsync(c => c.StandingId == standing.Id && c.ValidUntil >= nowUtc, cancellationToken);

            if (existingCert is not null)
            {
                return existingCert;
            }

            var cert = new RegularStudentCertificate
            {
                Id = Guid.NewGuid(),
                StandingId = standing.Id,
                FullName = $"{student.FirstName} {student.LastName}".Trim(),
                CareerName = career.Name,
                Term = standing.Term,
                IssuedAt = nowUtc,
                ValidUntil = standing.ValidUntilUtc
            };

            _context.RegularStudentCertificates.Add(cert);
            await _context.SaveChangesAsync(cancellationToken);
            return cert;
        }

        public async Task<RegularStudentCertificate?> GetMyRegularStudentCertificateAsync(
            Guid studentId,
            int careerId,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            await EnsureActiveUserAsync(studentId, cancellationToken);

            DateTime nowUtc = DateTime.UtcNow;
            return await _context.RegularStudentCertificates
                .AsNoTracking()
                .Include(c => c.Standing)
                .Where(c => c.Standing.StudentId == studentId &&
                            c.Standing.CareerId == careerId &&
                            c.Standing.RevokedAtUtc == null &&
                            c.ValidUntil >= nowUtc)
                .OrderByDescending(c => c.IssuedAt)
                .FirstOrDefaultAsync(cancellationToken);
        }

        private IQueryable<AcademicResource> ResourceGraph(bool ignoreFilters = false)
        {
            IQueryable<AcademicResource> query = _context.AcademicResources;
            if (ignoreFilters)
                query = query.IgnoreQueryFilters();

            return query
                .AsNoTracking()
                .AsSplitQuery()
                .Include(resource => resource.Subject)
                .ThenInclude(subject => subject.Career)
                .Include(resource => resource.Uploader);
        }

        private IQueryable<AcademicProgress> ProgressGraph()
        {
            return _context.AcademicProgressRecords
                .AsNoTracking()
                .AsSplitQuery()
                .Include(progress => progress.User)
                .Include(progress => progress.AssignedBy)
                .Include(progress => progress.Subject)
                .ThenInclude(subject => subject.Career);
        }

        private async Task<AcademicResource> LoadResourceGraphAsync(
            Guid resourceId,
            bool ignoreFilters = false,
            CancellationToken cancellationToken = default)
        {
            return await ResourceGraph(ignoreFilters)
                .SingleOrDefaultAsync(resource => resource.Id == resourceId, cancellationToken)
                ?? throw new InvalidOperationException("Recurso academico no encontrado.");
        }

        private async Task<AcademicProgress> LoadProgressGraphAsync(
            Guid progressId,
            CancellationToken cancellationToken)
        {
            return await ProgressGraph()
                .SingleOrDefaultAsync(progress => progress.Id == progressId, cancellationToken)
                ?? throw new InvalidOperationException("Progreso academico no encontrado.");
        }

        private async Task<Subject> LoadActiveSubjectAsync(
            int subjectId,
            CancellationToken cancellationToken)
        {
            return await _context.Subjects
                .AsNoTracking()
                .Include(subject => subject.Career)
                .SingleOrDefaultAsync(
                    subject => subject.Id == subjectId && subject.IsActive && subject.Career.IsActive,
                    cancellationToken)
                ?? throw new InvalidOperationException("Materia no encontrada o inactiva.");
        }

        private async Task EnsureCanViewSubjectAsync(
            Guid actorUserId,
            string? actorRole,
            int careerId,
            CancellationToken cancellationToken)
        {
            if (string.Equals(actorRole, "Administrador", StringComparison.Ordinal))
                return;

            bool belongsToCareer = await _context.UserCareers
                .AnyAsync(
                    link => link.UserId == actorUserId && link.CareerId == careerId,
                    cancellationToken);
            if (!belongsToCareer)
                throw new InvalidOperationException("No tenes acceso a los recursos de esta materia.");
        }

        private async Task EnsureCanCreateResourceAsync(
            Guid actorUserId,
            string? actorRole,
            int careerId,
            CancellationToken cancellationToken)
        {
            await EnsureCanManageSubjectAsync(
                actorUserId,
                actorRole,
                careerId,
                cancellationToken);
        }

        private async Task EnsureCanManageSubjectAsync(
            Guid actorUserId,
            string? actorRole,
            int careerId,
            CancellationToken cancellationToken)
        {
            if (string.Equals(actorRole, "Administrador", StringComparison.Ordinal))
                return;

            if (!string.Equals(actorRole, "Profesor", StringComparison.Ordinal))
            {
                throw new InvalidOperationException(
                    "No tenes permisos para gestionar contenido academico.");
            }

            bool belongsToCareer = await _context.UserCareers
                .AsNoTracking()
                .AnyAsync(
                    link => link.UserId == actorUserId && link.CareerId == careerId,
                    cancellationToken);
            if (!belongsToCareer)
            {
                throw new InvalidOperationException(
                    "No tenes permisos para gestionar materias fuera de tus carreras asignadas.");
            }
        }

        private async Task EnsureActiveUserAsync(
            Guid userId,
            CancellationToken cancellationToken)
        {
            bool exists = await _context.Users.AnyAsync(
                user => user.Id == userId && user.IsActive,
                cancellationToken);
            if (!exists)
                throw new InvalidOperationException("Usuario no encontrado o inactivo.");
        }

        private async Task<Guid[]> GetAcademicAudienceAsync(
            int careerId,
            Guid excludedUserId,
            CancellationToken cancellationToken)
        {
            return await _context.UserCareers
                .AsNoTracking()
                .Where(link =>
                    link.CareerId == careerId &&
                    link.UserId != excludedUserId &&
                    link.User.IsActive &&
                    link.User.Role == "Estudiante")
                .Select(link => link.UserId)
                .Distinct()
                .ToArrayAsync(cancellationToken);
        }

        private async Task NotifyAcademicProgressAsync(
            Guid userId,
            int subjectId,
            string subjectName,
            Guid progressId,
            CancellationToken cancellationToken)
        {
            await _notificationService.CreateNotificationsAsync(
                new[] { userId },
                NotificationType.AcademicProgress,
                $"Se actualizo tu progreso academico en {subjectName}.",
                $"/academic?subjectId={subjectId}&progressId={progressId:D}",
                cancellationToken);
        }

        private static void EnsureAdmin(string? role)
        {
            if (!string.Equals(role, "Administrador", StringComparison.Ordinal))
                throw new InvalidOperationException("La consulta requiere rol Administrador.");
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
                normalized.Contains("..", StringComparison.Ordinal) ||
                (!normalized.StartsWith("/uploads/", StringComparison.Ordinal) &&
                 !IsAllowedCloudinaryUrl(normalized)))
            {
                throw new InvalidOperationException("La URL del archivo academico no es valida.");
            }

            return normalized;
        }

        private static bool IsAllowedCloudinaryUrl(string value)
        {
            return Uri.TryCreate(value, UriKind.Absolute, out Uri? parsed) &&
                parsed.Scheme == Uri.UriSchemeHttps &&
                (parsed.Host.Equals("res.cloudinary.com", StringComparison.OrdinalIgnoreCase) ||
                 parsed.Host.EndsWith(".cloudinary.com", StringComparison.OrdinalIgnoreCase));
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

        private static string NormalizeEmailKey(string email)
        {
            return email.Trim().ToLowerInvariant();
        }

        private static int NormalizeVersion(int? version)
        {
            int normalized = version.GetValueOrDefault(1);
            if (normalized < 1)
                throw new ArgumentException("La version del recurso debe ser mayor o igual a 1.");
            return normalized;
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
