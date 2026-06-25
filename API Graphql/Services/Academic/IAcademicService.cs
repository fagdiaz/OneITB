using OneItb.Entities.Models;
using Services.Siu;

namespace Services.Academic
{
    public interface IAcademicService
    {
        Task<IReadOnlyList<AcademicResource>> GetAcademicResourcesAsync(Guid actorUserId, string? actorRole, int subjectId);
        Task<AcademicResource> AddAcademicResourceAsync(Guid actorUserId, string? actorRole, int subjectId, string title, string? description, string? fileUrl, string? externalUrl);
        Task<AcademicResource> ToggleAcademicResourceStatusAsync(Guid actorUserId, string? actorRole, Guid resourceId);
        Task<IReadOnlyList<AcademicProgress>> GetMyAcademicProgressAsync(Guid actorUserId);
        Task<IReadOnlyList<AcademicProgress>> GetAcademicProgressForUserAsync(Guid actorUserId, string? actorRole, Guid userId);
        Task<IReadOnlyList<User>> GetAcademicStudentsAsync(Guid actorUserId, string? actorRole, int subjectId);
        Task<AcademicProgress> UpsertAcademicProgressAsync(Guid actorUserId, string? actorRole, Guid userId, int subjectId, decimal? score, AcademicProgressStatus status, string? notes);
        Task<SiuSyncResult> SyncSiuGradesAsync(Guid actorUserId, string? actorRole, int subjectId);
    }
}
