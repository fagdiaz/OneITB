using OneItb.Entities.Models;

namespace Services.Jobs;

public sealed class ApplicationCvException(string message, string code = "USER_ERROR") : InvalidOperationException(message)
{
    public string Code { get; } = code;
}

public sealed record ApplicationSummary(Guid Id, Guid JobOfferId, JobApplicationStatus Status, DateTime AppliedAt);
public sealed record ApplicationCvPreview(string Version, ApplicationCv Cv, bool CanSubmit);
public sealed record ApplicationExperience(string Company, string Role, string? StartDate, string? EndDate, string? Location, string? Description);
public sealed record ApplicationEducation(string Institution, string Degree, string? StartDate, string? EndDate, string? Location, string? Description);
public sealed record ApplicationProject(string Name, string? Role, string? StartDate, string? EndDate, string? Url, string? Description);
public sealed record ApplicationSkill(string Name, string? Level);

public sealed record ApplicationCv(int SchemaVersion, string Name, string Title, string Email, string? Phone,
    string[] CareerNames, string? LinkedIn, string? Website, string? Summary,
    ApplicationExperience[] Experience, ApplicationEducation[] Education, ApplicationProject[] Projects,
    ApplicationSkill[] Skills, ApplicationSkill[] Languages)
{
    internal bool HasProfessionalContent() => !string.IsNullOrWhiteSpace(Summary)
        || Experience.Any(x => HasText(x.Role, x.Company, x.Description))
        || Education.Any(x => HasText(x.Institution, x.Degree, x.Description))
        || Projects.Any(x => HasText(x.Name, x.Role, x.Url, x.Description))
        || Skills.Concat(Languages).Any(x => HasText(x.Name, x.Level));

    private static bool HasText(params string?[] values) => values.Any(value => !string.IsNullOrWhiteSpace(value));
}
