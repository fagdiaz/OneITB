namespace Services.Academic;

public enum InstitutionalEnrollmentStatus
{
    SelfDeclarationRequired,
    Unavailable,
    Confirmed
}

public enum InstitutionalEnrollmentSource
{
    SelfDeclared,
    Institutional
}

public sealed record InstitutionalIdentity(
    Guid UserId,
    string InstitutionalEmail,
    string? TenantId = null,
    string? ExternalSubject = null);

public sealed record InstitutionalEnrollmentResult(
    InstitutionalEnrollmentStatus Status,
    string? CareerCode,
    IReadOnlyList<string> SubjectCodes,
    InstitutionalEnrollmentSource Source,
    DateTimeOffset ObservedAtUtc,
    string Message)
{
    public bool IsAuthoritative =>
        Status == InstitutionalEnrollmentStatus.Confirmed
        && Source == InstitutionalEnrollmentSource.Institutional
        && !string.IsNullOrWhiteSpace(CareerCode);
}

public sealed class InstitutionalEnrollmentOptions
{
    public const string SelfDeclaredMode = "SelfDeclared";
    public const string LegacyManualMode = "Manual";
    public const string UnavailableMode = "Unavailable";

    public string Mode { get; }

    public InstitutionalEnrollmentOptions(string? mode)
    {
        string normalizedMode = mode?.Trim() ?? string.Empty;
        Mode = string.Equals(normalizedMode, UnavailableMode, StringComparison.OrdinalIgnoreCase)
            ? UnavailableMode
            : SelfDeclaredMode;
    }
}

public sealed class StudentEnrollmentException : InvalidOperationException
{
    public StudentEnrollmentException(string code, string message, Exception? innerException = null)
        : base(message, innerException)
    {
        Code = code;
    }

    public string Code { get; }
}

internal static class StudentCareerSelectionPolicy
{
    public const string StudentRole = "Estudiante";

    public static int[] NormalizeAndValidate(string? role, IEnumerable<int>? careerIds)
    {
        int[] normalizedIds = careerIds?
            .Where(id => id > 0)
            .Distinct()
            .OrderBy(id => id)
            .ToArray() ?? Array.Empty<int>();

        if (string.Equals(role?.Trim(), StudentRole, StringComparison.OrdinalIgnoreCase))
        {
            if (normalizedIds.Length != 1)
            {
                throw new StudentEnrollmentException(
                    "ACADEMIC_STUDENT_SINGLE_CAREER_REQUIRED",
                    "Los estudiantes deben seleccionar exactamente una carrera activa.");
            }

            return normalizedIds;
        }

        if (normalizedIds.Length == 0)
        {
            throw new StudentEnrollmentException(
                "ACADEMIC_CAREER_REQUIRED",
                "Selecciona al menos una carrera activa.");
        }

        return normalizedIds;
    }
}
