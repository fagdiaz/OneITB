using System.Security.Cryptography;
using System.Text.Json;
using OneItb.Entities.Models;

namespace Services.Jobs;

// Input is the saved applicant aggregate, including Account, careers and all five CV collections.
public sealed record CapturedApplicationCv(string Json, string Version)
{
    public static CapturedApplicationCv From(User applicant)
    {
        var experience = applicant.CvExperiences.Where(x => !x.IsHidden)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            .Select(x => new { x.Company, x.Role, x.StartDate, x.EndDate, x.Location, x.Description }).ToArray();
        var education = applicant.CvEducations.Where(x => !x.IsHidden)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            .Select(x => new { x.Institution, x.Degree, x.StartDate, x.EndDate, x.Location, x.Description }).ToArray();
        var projects = applicant.CvProjects.Where(x => !x.IsHidden)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            .Select(x => new { x.Name, x.Role, x.StartDate, x.EndDate, Url = SafeWebUrl(x.Url), x.Description }).ToArray();
        var skills = applicant.CvSkills.Where(x => !x.IsHidden)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id).Select(x => new { x.Name, x.Level }).ToArray();
        var languages = applicant.CvLanguages.Where(x => !x.IsHidden)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Id).Select(x => new { x.Name, x.Level }).ToArray();

        var snapshot = new
        {
            schemaVersion = 1,
            name = $"{applicant.FirstName} {applicant.LastName}".Trim(),
            title = applicant.Role,
            email = applicant.Account.Email,
            applicant.Phone,
            careerNames = applicant.UserCareers.OrderBy(link => link.CareerId).Select(link => link.Career.Name).ToArray(),
            linkedIn = SafeWebUrl(applicant.LinkedIn),
            website = SafeWebUrl(applicant.Facebook) ?? SafeWebUrl(applicant.Instagram),
            summary = applicant.Biography,
            experience, education, projects, skills, languages
        };

        byte[] bytes = JsonSerializer.SerializeToUtf8Bytes(snapshot, JsonOptions);
        return new CapturedApplicationCv(System.Text.Encoding.UTF8.GetString(bytes),
            Convert.ToHexString(SHA256.HashData(bytes)));
    }

    public static ApplicationCv Read(string json) =>
        JsonSerializer.Deserialize<ApplicationCv>(json, JsonOptions)
        ?? throw new JsonException("La captura de CV no es válida.");

    public static string VersionOf(string json) =>
        Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(json)));

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private static string? SafeWebUrl(string? value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
        (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp) &&
        string.IsNullOrEmpty(uri.UserInfo) ? uri.AbsoluteUri : null;
}
