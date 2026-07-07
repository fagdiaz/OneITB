using HotChocolate.Execution;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Tests.TestSupport;
using GraphQL.GraphQL;
using Xunit;

namespace Services.Tests.GraphQL;

public sealed class PublicCertificateGraphQLTests
{
    [Fact]
    public async Task PublicCertificate_ReturnsApprovedProgressThroughRealSchema()
    {
        string databaseName = $"oneitb-graphql-integration-{Guid.NewGuid():N}";
        Guid progressId = Guid.NewGuid();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddDbContext<OneItbContext>(options => options.UseInMemoryDatabase(databaseName));
        services
            .AddGraphQLServer()
            .AddProjections()
            .AddFiltering()
            .AddSorting()
            .AddAuthorization()
            .AddQueryType<Query>();

        await using ServiceProvider provider = services.BuildServiceProvider();
        await SeedApprovedProgressAsync(provider, progressId);

        IRequestExecutor executor = await provider
            .GetRequiredService<IRequestExecutorResolver>()
            .GetRequestExecutorAsync();

        IExecutionResult result = await executor.ExecuteAsync($$"""
            query {
              publicCertificate(id: "{{progressId}}") {
                id
                studentFullName
                subjectName
                subjectCode
                careerName
                score
                status
              }
            }
            """);

        object? errors = result.GetType().GetProperty("Errors")?.GetValue(result);
        Assert.Null(errors);

        object? dataObject = result.GetType().GetProperty("Data")?.GetValue(result);
        Assert.NotNull(dataObject);
        IReadOnlyDictionary<string, object?> data = Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(
            dataObject);
        object? certificateObject = data["publicCertificate"];
        Assert.NotNull(certificateObject);
        IReadOnlyDictionary<string, object?> certificate = Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(
            certificateObject);

        Assert.Equal("Sofia Alumno", certificate["studentFullName"]);
        Assert.Equal("Programacion I", certificate["subjectName"]);
        Assert.Equal("PRG1", certificate["subjectCode"]);
        Assert.Equal("Analisis de Sistemas", certificate["careerName"]);
        Assert.Equal("Approved", certificate["status"]);
    }

    private static async Task SeedApprovedProgressAsync(IServiceProvider provider, Guid progressId)
    {
        await using AsyncServiceScope scope = provider.CreateAsyncScope();
        OneItbContext context = scope.ServiceProvider.GetRequiredService<OneItbContext>();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        context.AcademicProgressRecords.Add(new AcademicProgress
        {
            Id = progressId,
            UserId = ServiceTestData.StudentUserId,
            SubjectId = ServiceTestData.SubjectId,
            AssignedById = ServiceTestData.AdminUserId,
            Score = 9,
            Status = AcademicProgressStatus.Approved,
            UpdatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();
    }
}
