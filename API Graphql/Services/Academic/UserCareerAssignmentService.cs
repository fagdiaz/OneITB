using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;

namespace Services.Academic;

public sealed class UserCareerAssignmentService : IUserCareerAssignmentService
{
    private readonly OneItbContext _context;

    public UserCareerAssignmentService(OneItbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Career>> ReplaceAsync(
        User user,
        IReadOnlyCollection<int> careerIds,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(user);
        ArgumentNullException.ThrowIfNull(careerIds);

        int[] normalizedIds = StudentCareerSelectionPolicy.NormalizeAndValidate(
            user.Role,
            careerIds);

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

        List<UserCareer> existingLinks = user.UserCareers.ToList();
        int[] existingIds = existingLinks
            .Select(link => link.CareerId)
            .Distinct()
            .OrderBy(id => id)
            .ToArray();

        if (existingIds.SequenceEqual(normalizedIds))
            return careers;

        _context.UserCareers.RemoveRange(existingLinks.Where(link =>
            !normalizedIds.Contains(link.CareerId)));

        foreach (int careerId in normalizedIds.Where(id => !existingIds.Contains(id)))
        {
            user.UserCareers.Add(new UserCareer
            {
                UserId = user.Id,
                CareerId = careerId
            });
        }

        return careers;
    }
}
