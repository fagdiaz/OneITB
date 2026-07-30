using HotChocolate.Execution;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Tests.TestSupport;
using GraphQL.GraphQL;
using Xunit;

namespace Services.Tests.GraphQL;

public sealed class PublicProfilePrivacyGraphQLTests
{
    [Fact]
    public async Task QuerySchema_DoesNotExposeLegacyUnmaskedUserById()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddHttpContextAccessor();
        services.AddDbContext<OneItbContext>(options =>
            options.UseInMemoryDatabase($"oneitb-profile-schema-{Guid.NewGuid():N}"));
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
            query {
              __type(name: "Query") {
                fields {
                  name
                }
              }
            }
            """);

        IReadOnlyDictionary<string, object?> data =
            Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(
                result.GetType().GetProperty("Data")?.GetValue(result));
        IReadOnlyDictionary<string, object?> queryType =
            Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(data["__type"]);
        IReadOnlyList<object?> fields =
            Assert.IsAssignableFrom<IReadOnlyList<object?>>(queryType["fields"]);
        string[] names = fields
            .Select(field =>
                Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(field)["name"]?.ToString())
            .Where(name => name is not null)
            .Cast<string>()
            .ToArray();

        Assert.Contains("publicProfile", names);
        Assert.Contains("me", names);
        Assert.DoesNotContain("userById", names);
    }

    [Fact]
    public async Task PublicProfile_MasksSensitiveFields_WhenProfileIsPrivateAndViewerIsAnonymous()
    {
        string databaseName = $"oneitb-profile-privacy-{Guid.NewGuid():N}";

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddHttpContextAccessor();
        services.AddDbContext<OneItbContext>(options => options.UseInMemoryDatabase(databaseName));
        services
            .AddGraphQLServer()
            .AddProjections()
            .AddFiltering()
            .AddSorting()
            .AddAuthorization()
            .AddQueryType<Query>();

        await using ServiceProvider provider = services.BuildServiceProvider();
        await SeedPrivateProfileAsync(provider);

        IRequestExecutor executor = await provider
            .GetRequiredService<IRequestExecutorResolver>()
            .GetRequestExecutorAsync();

        IExecutionResult result = await executor.ExecuteAsync($$"""
            query {
              publicProfile(userId: "{{ServiceTestData.StudentUserId}}") {
                id
                fullName
                role
                biography
                phone
                isPublicProfile
                canViewSensitiveProfile
                careers
                cvSkills {
                  id
                  name
                }
              }
            }
            """);

        object? errors = result.GetType().GetProperty("Errors")?.GetValue(result);
        Assert.Null(errors);

        object? dataObject = result.GetType().GetProperty("Data")?.GetValue(result);
        Assert.NotNull(dataObject);
        IReadOnlyDictionary<string, object?> data = Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(
            dataObject);
        object? profileObject = data["publicProfile"];
        Assert.NotNull(profileObject);
        IReadOnlyDictionary<string, object?> profile = Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(
            profileObject);

        Assert.Equal("Sofia Alumno", profile["fullName"]);
        Assert.Equal("Estudiante", profile["role"]);
        Assert.False((bool)profile["isPublicProfile"]!);
        Assert.False((bool)profile["canViewSensitiveProfile"]!);
        Assert.Null(profile["biography"]);
        Assert.Null(profile["phone"]);
        Assert.Empty(Assert.IsAssignableFrom<IReadOnlyList<object?>>(profile["careers"]));
        Assert.Empty(Assert.IsAssignableFrom<IReadOnlyList<object?>>(profile["cvSkills"]));
    }

    private static async Task SeedPrivateProfileAsync(IServiceProvider provider)
    {
        await using AsyncServiceScope scope = provider.CreateAsyncScope();
        OneItbContext context = scope.ServiceProvider.GetRequiredService<OneItbContext>();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        User student = await context.Users.SingleAsync(user => user.Id == ServiceTestData.StudentUserId);
        student.IsPublicProfile = false;
        student.Biography = "Biografia privada";
        student.Phone = "+54 9 11 1234-5678";
        context.UserCvSkills.Add(new UserCvSkill
        {
            Id = Guid.NewGuid(),
            UserId = student.Id,
            Name = "GraphQL",
            Level = "Avanzado",
            SortOrder = 1
        });

        await context.SaveChangesAsync();
    }
}
