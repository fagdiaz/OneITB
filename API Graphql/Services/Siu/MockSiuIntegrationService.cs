using OneItb.Entities.Models;

namespace Services.Siu
{
    public sealed class MockSiuIntegrationService : ISiuIntegrationService
    {
        public Task<IReadOnlyList<SiuGradeRecord>> GetGradesAsync(
            int subjectId,
            CancellationToken cancellationToken = default)
        {
            IReadOnlyList<SiuGradeRecord> records = new[]
            {
                new SiuGradeRecord(
                    "student@itbeltran.com.ar",
                    8.75m,
                    AcademicProgressStatus.Approved,
                    $"Sincronizado desde SIU Guarani mock para materia {subjectId}."),
                new SiuGradeRecord(
                    "diego.molina@itbeltran.com.ar",
                    7.50m,
                    AcademicProgressStatus.Regular,
                    $"Sincronizado desde SIU Guarani mock para materia {subjectId}."),
                new SiuGradeRecord(
                    "siu.alumno.inexistente@itbeltran.com.ar",
                    6.00m,
                    AcademicProgressStatus.Regular,
                    $"Registro mock sin cuenta local para materia {subjectId}.")
            };

            return Task.FromResult(records);
        }
    }
}
