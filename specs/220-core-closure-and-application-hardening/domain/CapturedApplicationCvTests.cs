using System.Text.Json;
using OneItb.Entities.Models;
using Services.Jobs;
using Xunit;

namespace Services.Tests.Jobs;

public class CapturedApplicationCvTests
{
    [Fact]
    public void CapturesOnlyVisibleSavedDataAndKeepsTheOriginalAfterEditing()
    {
        var applicant = new User { FirstName = "Ana", LastName = "Paz", Role = "Egresado",
            Account = new Account { Email = "ana@example.test" }, LinkedIn = "javascript:alert(1)" };
        applicant.CvSkills.Add(new UserCvSkill { Name = "Dato oculto", IsHidden = true });
        applicant.CvSkills.Add(new UserCvSkill { Name = "SQL", SortOrder = 2 });
        applicant.CvSkills.Add(new UserCvSkill { Name = "C#", SortOrder = 1 });
        applicant.CvProjects.Add(new UserCvProject { Name = "Proyecto visible" });
        applicant.CvLanguages.Add(new UserCvLanguage { Name = "Italiano" });
        var delivered = CapturedApplicationCv.From(applicant);
        Assert.Equal(delivered, CapturedApplicationCv.From(applicant));
        applicant.CvSkills.Clear();
        var edited = CapturedApplicationCv.From(applicant);

        Assert.NotEqual(delivered.Version, edited.Version);
        Assert.DoesNotContain("Dato oculto", delivered.Json);
        using var document = JsonDocument.Parse(delivered.Json);
        var root = document.RootElement;
        Assert.Equal("C#", root.GetProperty("skills")[0].GetProperty("name").GetString());
        Assert.Equal("Proyecto visible", root.GetProperty("projects")[0].GetProperty("name").GetString());
        Assert.Equal("Italiano", root.GetProperty("languages")[0].GetProperty("name").GetString());
        Assert.Equal(JsonValueKind.Null, root.GetProperty("linkedIn").ValueKind);
    }
}
