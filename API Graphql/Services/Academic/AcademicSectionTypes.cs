using System;
using System.Collections.Generic;
using OneItb.Entities.Models;

namespace Services.Academic
{
    public sealed record CourseSectionSummary(Guid Id, int SubjectId, string Term, string Code);

    public sealed record RosterStudent(Guid UserId, string FullName, SectionGrade? Grade);

    public sealed record SectionRosterPage(IReadOnlyList<RosterStudent> Items, string? NextCursor, bool HasNextPage);

    public sealed record SectionGradeInput(
        Guid SectionId,
        Guid StudentId,
        decimal? Score,
        AcademicProgressStatus Status,
        string? ExpectedVersion);

    public sealed record AcademicTarget(int CareerId, int SubjectId, Guid? ResourceId, Guid? ProgressId);
}
