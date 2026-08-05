namespace Services.Academic;

public sealed class ManualInstitutionalEnrollmentProvider : IInstitutionalEnrollmentProvider
{
    private readonly InstitutionalEnrollmentOptions _options;

    public ManualInstitutionalEnrollmentProvider(InstitutionalEnrollmentOptions options)
    {
        _options = options;
    }

    public Task<InstitutionalEnrollmentResult> GetEnrollmentAsync(
        InstitutionalIdentity identity,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(identity);
        cancellationToken.ThrowIfCancellationRequested();

        InstitutionalEnrollmentResult result = string.Equals(
            _options.Mode,
            InstitutionalEnrollmentOptions.UnavailableMode,
            StringComparison.Ordinal)
            ? new InstitutionalEnrollmentResult(
                InstitutionalEnrollmentStatus.Unavailable,
                Array.Empty<string>(),
                Array.Empty<string>(),
                "La fuente institucional de inscripciones no esta disponible.")
            : new InstitutionalEnrollmentResult(
                InstitutionalEnrollmentStatus.ManualConfirmationRequired,
                Array.Empty<string>(),
                Array.Empty<string>(),
                "La carrera se confirma manualmente; no existe una consulta ITB/SIU activa.");

        return Task.FromResult(result);
    }
}
