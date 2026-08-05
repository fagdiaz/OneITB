using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using OneItb.Data;
using OneItb.Entities.Models;

namespace Services.Academic;

public sealed class StudentEnrollmentService : IStudentEnrollmentService
{
    private readonly OneItbContext _context;
    private readonly IUserCareerAssignmentService _careerAssignments;

    public StudentEnrollmentService(
        OneItbContext context,
        IUserCareerAssignmentService careerAssignments)
    {
        _context = context;
        _careerAssignments = careerAssignments;
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
                .Include(item => item.UserCareers)
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

            IReadOnlyList<Career> careers = await _careerAssignments.ReplaceAsync(
                user,
                requestedCareerIds.ToArray(),
                cancellationToken);

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
