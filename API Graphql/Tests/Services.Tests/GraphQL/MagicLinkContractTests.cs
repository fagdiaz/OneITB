using HotChocolate.Execution;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Moq;
using OneItb.GraphQL;
using OneItb.GraphQL.Services.Security;
using OneITB.Core.Services.Interfaces;
using OneITB.GraphQL.Mutations;
using Xunit;

namespace Services.Tests.GraphQL;

public sealed class MagicLinkContractTests
{
    [Fact]
    public void RequestMagicLink_ReturnsGenericPayloadWithoutCredentialFields()
    {
        var method = typeof(Mutation).GetMethod(nameof(Mutation.RequestMagicLink));

        Assert.NotNull(method);
        Assert.Equal(
            typeof(Task<MagicLinkRequestPayload>),
            method!.ReturnType);
        Assert.DoesNotContain(
            typeof(MagicLinkRequestPayload).GetProperties(),
            property => property.Name.Contains("Token", StringComparison.OrdinalIgnoreCase) ||
                        property.Name.Contains("Credential", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task RequestMagicLink_RealSchemaReturnsOnlyGenericPayload()
    {
        string contentRoot = Path.Combine(
            Path.GetTempPath(),
            $"oneitb-schema-{Guid.NewGuid():N}");
        Directory.CreateDirectory(contentRoot);
        try
        {
            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] =
                        "Server=localhost;Database=SchemaOnly;User Id=none;Password=none;TrustServerCertificate=True;",
                    ["Jwt:Key"] =
                        "oneitb23-schema-only-signing-key-with-at-least-32-bytes",
                    ["Jwt:Issuer"] = "OneITB23.SchemaTests",
                    ["Jwt:Audience"] = "OneITB23.SchemaTests.Web",
                    ["FileStorage:Provider"] = "Local",
                    ["Seed:EnableDemoData"] = "false"
                })
                .Build();
            IWebHostEnvironment environment = CreateEnvironment(contentRoot);
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddSingleton(configuration);
            services.AddSingleton(environment);
            services.AddSingleton<IHostEnvironment>(environment);

            new Startup(configuration, environment).ConfigureServices(services);
            services.RemoveAll<IEmployerAuthService>();
            services.RemoveAll<IMagicLinkRateLimiter>();
            services.AddSingleton<IEmployerAuthService>(
                new StubEmployerAuthService());
            services.AddSingleton<IMagicLinkRateLimiter>(
                new AllowAllMagicLinkRateLimiter());

            await using ServiceProvider provider = services.BuildServiceProvider();
            IRequestExecutor executor = await provider
                .GetRequiredService<IRequestExecutorResolver>()
                .GetRequestExecutorAsync();
            IExecutionResult result = await executor.ExecuteAsync("""
                mutation {
                  requestMagicLink(
                    email: "employer@itbeltran.com.ar"
                    cuit: "30712345678"
                  ) {
                    accepted
                    message
                  }
                }
                """);

            object? errors = result.GetType().GetProperty("Errors")?.GetValue(result);
            Assert.Null(errors);
            object? dataObject = result.GetType().GetProperty("Data")?.GetValue(result);
            IReadOnlyDictionary<string, object?> data =
                Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(dataObject);
            IReadOnlyDictionary<string, object?> payload =
                Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(
                    data["requestMagicLink"]);

            Assert.True((bool)payload["accepted"]!);
            Assert.False(string.IsNullOrWhiteSpace(payload["message"]?.ToString()));
            Assert.Equal(
                new[] { "accepted", "message" },
                payload.Keys.OrderBy(key => key, StringComparer.Ordinal));
        }
        finally
        {
            Directory.Delete(contentRoot, recursive: true);
        }
    }

    private static IWebHostEnvironment CreateEnvironment(string contentRoot)
    {
        var environment = new Mock<IWebHostEnvironment>();
        environment.SetupGet(item => item.EnvironmentName)
            .Returns(Environments.Development);
        environment.SetupGet(item => item.ApplicationName)
            .Returns(typeof(Startup).Assembly.GetName().Name!);
        environment.SetupGet(item => item.ContentRootPath).Returns(contentRoot);
        environment.SetupGet(item => item.WebRootPath)
            .Returns(Path.Combine(contentRoot, "wwwroot"));
        return environment.Object;
    }

    private sealed class StubEmployerAuthService : IEmployerAuthService
    {
        public Task<MagicLinkRequestPayload> RequestMagicLinkAsync(
            string email,
            string cuit,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new MagicLinkRequestPayload(
                true,
                "Si los datos son validos, recibiras un enlace."));
        }

        public Task<string> LoginWithMagicLinkAsync(
            string token,
            CancellationToken cancellationToken = default)
        {
            throw new NotSupportedException();
        }

        public Task SendWelcomeMagicLinkAsync(
            Guid employerRequestId,
            CancellationToken cancellationToken = default)
        {
            throw new NotSupportedException();
        }
    }

    private sealed class AllowAllMagicLinkRateLimiter : IMagicLinkRateLimiter
    {
        public Task<MagicLinkRateLimitDecision> TryAcquireRequestAsync(
            string clientSource,
            string email,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(MagicLinkRateLimitDecision.Allowed());
        }

        public Task<MagicLinkRateLimitDecision> TryAcquireRedemptionAsync(
            string clientSource,
            string credential,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(MagicLinkRateLimitDecision.Allowed());
        }
    }
}
