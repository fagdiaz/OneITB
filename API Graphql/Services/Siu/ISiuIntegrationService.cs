namespace Services.Siu
{
    public interface ISiuIntegrationService
    {
        Task<IReadOnlyList<SiuGradeRecord>> GetGradesAsync(int subjectId, CancellationToken cancellationToken = default);
    }
}
