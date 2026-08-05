using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using OneItb.Data;
using OneItb.Entities.Models;

namespace Services.Academic;

public sealed class StudentEnrollmentService : IStudentEnrollmentService
{
    private readonly OneItbContext _context;

    public StudentEnrollmentService(OneItbContext context)
    {
        _context = context;
    }

    public async Task<Career> ConfirmStudentCareerAsync(
        Guid userId,
        int careerId,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Career> careers = await ReplaceCareersAsync(
            userId,
            new[] { careerId },
            requireStudent: true,
            cancellationToken);

        return careers.Single();
    }

    public Task<IReadOnlyList<Career>> ReplaceSelfServiceCareersAsync(
        Guid userId,
        IReadOnlyCollection<int> careerIds,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(careerIds);
        return ReplaceCareersAsync(userId, careerIds, requireStudent: false, cancellationToken);
    }

    private async Task<IReadOnlyList<Career>> ReplaceCareersAsync(
        Guid userId,
        IEnumerable<int> requestedCareerIds,
        bool requireStudent,
        CancellationToken cancellationToken)
    {
        await using IDbContextTransaction? transaction = _context.Database.IsRelational()
            ? await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken)
            : null;

        try
        {
            User? user = await _context.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(
                    item => item.Id == userId && item.IsActive,
                    cancellationToken);
            if (user is null)
            {
                throw new StudentEnrollmentException(
                    "AUTH_NOT_AUTHORIZED",
                    "No se pudo validar al usuario autenticado.");
            }

            if (requireStudent && !string.Equals(
                    user.Role,
                    StudentCareerSelectionPolicy.StudentRole,
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new StudentEnrollmentException(
                    "AUTH_NOT_AUTHORIZED",
                    "La confirmacion academica esta disponible solo para estudiantes.");
            }

            int[] normalizedIds = StudentCareerSelectionPolicy.NormalizeAndValidate(
                user.Role,
                requestedCareerIds);

            List<Career> careers = await _context.Careers
                .AsNoTracking()
                .Where(career => normalizedIds.Contains(career.Id) && career.IsActive)
                .OrderBy(career => career.Name)
                .ThenBy(career => career.Id)
                .ToListAsync(cancellationToken);
            if (careers.Count != normalizedIds.Length)
            {
                throw new StudentEnrollmentException(
                    "ACADEMIC_CAREER_INVALID",
                    "La carrera seleccionada no existe o no se encuentra activa.");
            }

            List<UserCareer> existingLinks = await _context.UserCareers
                .Where(link => link.UserId == userId)
                .ToListAsync(cancellationToken);
            int[] existingIds = existingLinks
                .Select(link => link.CareerId)
                .Distinct()
                .OrderBy(id => id)
                .ToArray();

            if (existingIds.SequenceEqual(normalizedIds))
            {
                if (transaction is not null)
                    await transaction.CommitAsync(cancellationToken);
                return careers;
            }

            _context.UserCareers.RemoveRange(existingLinks.Where(link =>
                !normalizedIds.Contains(link.CareerId)));
            _context.UserCareers.AddRange(normalizedIds
                .Where(careerId => !existingIds.Contains(careerId))
                .Select(careerId => new UserCareer
            {
                UserId = userId,
                CareerId = careerId
            }));

            await _context.SaveChangesAsync(cancellationToken);
            if (transaction is not null)
                await transaction.CommitAsync(cancellationToken);

            return careers;
        }
        catch (DbUpdateException exception)
        {
            if (transaction is not null)
                await transaction.RollbackAsync(CancellationToken.None);
            _context.ChangeTracker.Clear();
            throw new StudentEnrollmentException(
                "ACADEMIC_ENROLLMENT_CONFLICT",
                "La identidad academica cambio durante la confirmacion. Intenta nuevamente.",
                exception);
        }
        catch
        {
            if (transaction is not null)
                await transaction.RollbackAsync(CancellationToken.None);
            throw;
        }
    }
}
