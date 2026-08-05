using OneItb.Entities.Models;

namespace Services.Academic;

public interface IStudentEnrollmentService
{
    Task<Career> ConfirmStudentCareerAsync(
        Guid userId,
        int careerId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Career>> ReplaceSelfServiceCareersAsync(
        Guid userId,
        IReadOnlyCollection<int> careerIds,
        CancellationToken cancellationToken = default);
}

public interface IInstitutionalEnrollmentProvider
{
    Task<InstitutionalEnrollmentResult> GetEnrollmentAsync(
        InstitutionalIdentity identity,
        CancellationToken cancellationToken = default);
}
