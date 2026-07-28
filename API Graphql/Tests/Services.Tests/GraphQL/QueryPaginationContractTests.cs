using GraphQL.GraphQL;
using HotChocolate.Execution;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OneItb.Data;
using OneITB.Core.Services.Interfaces;
using Xunit;

namespace Services.Tests.GraphQL;

public sealed class QueryPaginationContractTests
{
    [Fact]
    public async Task QuerySchema_ExposesOnlyBoundedInquiryAndAcademicStudentContracts()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddHttpContextAccessor();
        services.AddDbContext<OneItbContext>(options =>
            options.UseInMemoryDatabase($"oneitb-pagination-contract-{Guid.NewGuid():N}"));
        services
            .AddGraphQLServer()
            .AddProjections()
            .AddFiltering()
            .AddSorting()
            .AddAuthorization()
            .AddQueryType<Query>();

        await using ServiceProvider provider = services.BuildServiceProvider();
        IRequestExecutor executor = await provider
            .GetRequiredService<IRequestExecutorResolver>()
            .GetRequestExecutorAsync();

        IExecutionResult result = await executor.ExecuteAsync("""
            query PaginationContract {
              __type(name: "Query") {
                fields {
                  name
                  args { name }
                }
              }
            }
            """);

        object? dataObject = result.GetType().GetProperty("Data")?.GetValue(result);
        IReadOnlyDictionary<string, object?> data = Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(
            dataObject);
        IReadOnlyDictionary<string, object?> queryType =
            Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(data["__type"]);
        IReadOnlyList<object?> fields =
            Assert.IsAssignableFrom<IReadOnlyList<object?>>(queryType["fields"]);
        Dictionary<string, string[]> contract = fields
            .Select(field => Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(field))
            .ToDictionary(
                field => Assert.IsType<string>(field["name"]),
                field => Assert.IsAssignableFrom<IReadOnlyList<object?>>(field["args"])
                    .Select(argument => Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(argument))
                    .Select(argument => Assert.IsType<string>(argument["name"]))
                    .ToArray(),
                StringComparer.Ordinal);

        Assert.DoesNotContain("inquiries", contract.Keys);
        Assert.Contains("inquiriesPage", contract.Keys);
        Assert.Contains("authorId", contract["inquiriesPage"]);
        Assert.Contains("first", contract["inquiriesPage"]);
        Assert.Contains("after", contract["inquiriesPage"]);
        Assert.Contains("academicStudents", contract.Keys);
        Assert.Contains("first", contract["academicStudents"]);
        Assert.Contains("after", contract["academicStudents"]);
    }

    [Fact]
    public void BoundedQueryResolvers_AcceptCancellationToken()
    {
        Type queryType = typeof(Query);
        string[] resolverNames =
        [
            nameof(Query.GetInquiriesPage),
            nameof(Query.GetAcademicStudents)
        ];

        foreach (string resolverName in resolverNames)
        {
            var method = queryType.GetMethod(resolverName)
                ?? throw new InvalidOperationException($"Resolver {resolverName} was not found.");
            Assert.Contains(
                method.GetParameters(),
                parameter => parameter.ParameterType == typeof(CancellationToken));
        }
    }

    [Fact]
    public void PaginationSources_DoNotReintroduceUnboundedOrSynchronousInquiryAccess()
    {
        Assert.Null(typeof(ISocialService).GetMethod("GetInquiries"));

        DirectoryInfo repositoryRoot = FindRepositoryRoot();
        string socialSource = File.ReadAllText(Path.Combine(
            repositoryRoot.FullName,
            "API Graphql",
            "Services",
            "Social",
            "SocialService.cs"));
        string academicSource = File.ReadAllText(Path.Combine(
            repositoryRoot.FullName,
            "API Graphql",
            "Services",
            "Academic",
            "AcademicService.cs"));

        Assert.DoesNotContain("_context.Users.Any(", socialSource, StringComparison.Ordinal);
        Assert.DoesNotContain("CountAsync()", socialSource, StringComparison.Ordinal);
        Assert.DoesNotContain("ToListAsync()", socialSource, StringComparison.Ordinal);
        Assert.DoesNotContain("CountAsync()", academicSource, StringComparison.Ordinal);
        Assert.DoesNotContain("ToListAsync()", academicSource, StringComparison.Ordinal);
    }

    private static DirectoryInfo FindRepositoryRoot()
    {
        DirectoryInfo? directory = new(AppContext.BaseDirectory);
        while (directory is not null)
        {
            if (Directory.Exists(Path.Combine(directory.FullName, "API Graphql")) &&
                Directory.Exists(Path.Combine(directory.FullName, "FrontEnd")))
            {
                return directory;
            }

            directory = directory.Parent;
        }

        throw new DirectoryNotFoundException("Repository root was not found from the test output directory.");
    }
}
