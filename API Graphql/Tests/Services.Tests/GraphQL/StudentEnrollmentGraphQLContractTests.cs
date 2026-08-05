using HotChocolate.Execution;
using Microsoft.Extensions.DependencyInjection;
using OneITB.GraphQL.Mutations;
using Xunit;

namespace Services.Tests.GraphQL;

public sealed class StudentEnrollmentGraphQLContractTests
{
    [Fact]
    public async Task MutationSchema_ExposesDedicatedSingleCareerConfirmation()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddHttpContextAccessor();
        services
            .AddGraphQLServer()
            .AddAuthorization()
            .AddQueryType(descriptor => descriptor
                .Name("Query")
                .Field("ping")
                .Type<HotChocolate.Types.NonNullType<HotChocolate.Types.StringType>>()
                .Resolve(_ => new ValueTask<object?>("pong")))
            .AddMutationType<Mutation>();

        await using ServiceProvider provider = services.BuildServiceProvider();
        IRequestExecutor executor = await provider
            .GetRequiredService<IRequestExecutorResolver>()
            .GetRequestExecutorAsync();

        IExecutionResult result = await executor.ExecuteAsync("""
            query StudentEnrollmentContract {
              __type(name: "Mutation") {
                fields {
                  name
                  args { name }
                }
              }
            }
            """);

        object? dataObject = result.GetType().GetProperty("Data")?.GetValue(result);
        IReadOnlyDictionary<string, object?> data =
            Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(dataObject);
        IReadOnlyDictionary<string, object?> mutationType =
            Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(data["__type"]);
        IReadOnlyList<object?> fields =
            Assert.IsAssignableFrom<IReadOnlyList<object?>>(mutationType["fields"]);
        Dictionary<string, string[]> contract = fields
            .Select(field => Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(field))
            .ToDictionary(
                field => Assert.IsType<string>(field["name"]),
                field => Assert.IsAssignableFrom<IReadOnlyList<object?>>(field["args"])
                    .Select(argument => Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(argument))
                    .Select(argument => Assert.IsType<string>(argument["name"]))
                    .ToArray(),
                StringComparer.Ordinal);

        Assert.Equal(new[] { "careerId" }, contract["confirmStudentCareer"]);
        Assert.Equal(new[] { "careerIds" }, contract["linkUserToCareers"]);
    }

}
