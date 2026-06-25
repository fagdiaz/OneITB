using OneItb.Entities.Models;

namespace Services.Siu
{
    public sealed record SiuGradeRecord(
        string StudentEmail,
        decimal? Score,
        AcademicProgressStatus Status,
        string? Notes);
}
