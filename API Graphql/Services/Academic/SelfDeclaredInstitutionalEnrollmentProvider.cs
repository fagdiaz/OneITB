namespace Services.Academic;

public sealed class SelfDeclaredInstitutionalEnrollmentProvider : IInstitutionalEnrollmentProvider
{
    private readonly InstitutionalEnrollmentOptions _options;

    public SelfDeclaredInstitutionalEnrollmentProvider(InstitutionalEnrollmentOptions options)
    {
        _options = options;
    }

    public Task<InstitutionalEnrollmentResult> GetEnrollmentAsync(
        InstitutionalIdentity identity,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(identity);
        cancellationToken.ThrowIfCancellationRequested();

        DateTimeOffset observedAtUtc = DateTimeOffset.UtcNow;
        InstitutionalEnrollmentResult result = string.Equals(
            _options.Mode,
            InstitutionalEnrollmentOptions.UnavailableMode,
            StringComparison.Ordinal)
            ? new InstitutionalEnrollmentResult(
                InstitutionalEnrollmentStatus.Unavailable,
                null,
                Array.Empty<string>(),
                InstitutionalEnrollmentSource.SelfDeclared,
                observedAtUtc,
                "La fuente institucional de inscripciones no esta disponible.")
            : new InstitutionalEnrollmentResult(
                InstitutionalEnrollmentStatus.SelfDeclarationRequired,
                null,
                Array.Empty<string>(),
                InstitutionalEnrollmentSource.SelfDeclared,
                observedAtUtc,
                "La carrera requiere declaracion y confirmacion local; no existe una consulta ITB/SIU activa.");

        return Task.FromResult(result);
    }
}
