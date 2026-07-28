using OneItb.Entities.Models;
using Services.Siu;

namespace Services.Academic
{
    public interface IAcademicService
    {
        Task<IReadOnlyList<AcademicResource>> GetAcademicResourcesAsync(Guid actorUserId, string? actorRole, int subjectId, string? searchTerm, AcademicResourceCategory? category, CancellationToken cancellationToken = default);
        Task<AcademicResource> AddAcademicResourceAsync(Guid actorUserId, string? actorRole, int subjectId, string title, string? description, AcademicResourceCategory? category, int? version, string? fileUrl, string? externalUrl, CancellationToken cancellationToken = default);
        Task<AcademicResource> DeleteResourceAsync(Guid actorUserId, string? actorRole, Guid resourceId, CancellationToken cancellationToken = default);
        Task<AcademicResource> ToggleAcademicResourceStatusAsync(Guid actorUserId, string? actorRole, Guid resourceId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<AcademicProgress>> GetMyAcademicProgressAsync(Guid actorUserId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<AcademicProgress>> GetAcademicProgressForUserAsync(Guid actorUserId, string? actorRole, Guid userId, CancellationToken cancellationToken = default);
        Task<AcademicStudentPage> GetAcademicStudentsPageAsync(Guid actorUserId, string? actorRole, int subjectId, int first, string? after, CancellationToken cancellationToken = default);
        Task<AcademicProgress> UpsertAcademicProgressAsync(Guid actorUserId, string? actorRole, Guid userId, int subjectId, decimal? score, AcademicProgressStatus status, string? notes, CancellationToken cancellationToken = default);
        Task<SiuSyncResult> SyncSiuGradesAsync(Guid actorUserId, string? actorRole, int subjectId, CancellationToken cancellationToken = default);
    }
}
