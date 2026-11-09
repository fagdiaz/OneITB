using System.Collections.Concurrent;
using System.Reflection;
using System.Text;
using System.Text.Json;
using HotChocolate;
using HotChocolate.Execution;
using HotChocolate.Language;
using HotChocolate.Resolvers;
using HotChocolate.Types;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using OneItb.Data;
using OneItb.GraphQL;
using OneItb.GraphQL.Infrastructure;
using Xunit;

namespace Services.Tests.GraphQL;

public sealed class GraphQLSecurityHardeningTests(GraphQLSecurityHardeningFixture fixture)
    : IClassFixture<GraphQLSecurityHardeningFixture>
{
    private const string SafeMessage =
        "Ocurrio un error inesperado. Intenta nuevamente o contacta a administracion.";

    [Fact]
    public async Task Depth16_IsRejectedBeforeAnyResolverOrDatabaseAccess()
    {
        var probe = new Gob16Probe();
        await using var result = await fixture.ExecuteAsync(Nested(16), probe);
        IError error = Rejection(result, probe);
        Assert.Equal("The GraphQL document has an execution depth of 16 which exceeds the max allowed execution depth of 15.",
            error.Message);
        Assert.Equal(15, Convert.ToInt32(error.Extensions!["allowedExecutionDepth"]));
        Assert.Equal(16, Convert.ToInt32(error.Extensions["detectedExecutionDepth"]));
        fixture.AssertNoDatabaseAccess();
    }

    [Theory]
    [InlineData(2)]
    [InlineData(8)]
    public async Task DepthWithinLimit_ReturnsCompleteData(int depth)
    {
        var probe = new Gob16Probe();
        await using var result = await fixture.ExecuteAsync(Nested(depth), probe);
        using var json = Success(result);
        JsonElement node = json.RootElement.GetProperty("data").GetProperty("gob16Node");
        for (int level = 2; level < depth; level++) node = node.GetProperty("next");
        Assert.Equal(42, node.GetProperty("value").GetInt32());
        Assert.Equal(depth, probe.Calls.Count);
        fixture.AssertNoDatabaseAccess();
    }

    [Fact]
    public async Task FragmentExpandedDepth16_CannotBypassDepthLimit()
    {
        var document = new StringBuilder("query { gob16Node { ...D0 } } ");
        for (int index = 0; index < 14; index++)
        {
            string onType = index % 2 == 0 ? "Gob16Node" : "Gob16NodeAlt";
            document.Append($"fragment D{index} on {onType} {{ next {{ ...D{index + 1} }} }} ");
        }
        document.Append("fragment D14 on Gob16Node { value }");
        var probe = new Gob16Probe();
        await using var result = await fixture.ExecuteAsync(document.ToString(), probe);
        IError error = Rejection(result, probe);
        Assert.Contains("exceeds the max allowed execution depth of 15", error.Message, StringComparison.Ordinal);
        Assert.Equal(15, Convert.ToInt32(error.Extensions!["allowedExecutionDepth"]));
        fixture.AssertNoDatabaseAccess();
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task AliasMultiplication_EnforcesFieldAndTypeCostIndependently(bool typeCost)
    {
        string field = typeCost ? "gob16Costly { value }" : "gob16Expensive";
        var rejectedProbe = new Gob16Probe();
        await using (var rejected = await fixture.ExecuteAsync(Aliases(field, 21), rejectedProbe))
        {
            IError error = Rejection(rejected, rejectedProbe);
            Assert.Equal("HC0047", error.Code);
            Assert.Equal(typeCost ? "The maximum allowed type cost was exceeded." :
                "The maximum allowed field cost was exceeded.", error.Message);
            string actualKey = typeCost ? "typeCost" : "fieldCost";
            string maximumKey = typeCost ? "maxTypeCost" : "maxFieldCost";
            Assert.True(Convert.ToDouble(error.Extensions![actualKey]) > 200_000);
            Assert.Equal(200_000d, Convert.ToDouble(error.Extensions[maximumKey]));
        }
        // A lower-cost request on the same executor must still execute completely.
        var acceptedProbe = new Gob16Probe();
        await using var accepted = await fixture.ExecuteAsync(Aliases(field, 2), acceptedProbe);
        using var json = Success(accepted);
        var data = json.RootElement.GetProperty("data");
        Assert.Equal(2, data.EnumerateObject().Count());
        foreach (var property in data.EnumerateObject())
            Assert.Equal(42, (typeCost ? property.Value.GetProperty("value") : property.Value).GetInt32());
        Assert.Equal(typeCost ? 4 : 2, acceptedProbe.Calls.Count);
        fixture.AssertNoDatabaseAccess();
    }

    [Theory]
    [InlineData(Gob16ParserLimit.Fields)]
    [InlineData(Gob16ParserLimit.Nodes)]
    [InlineData(Gob16ParserLimit.Tokens)]
    public async Task EachConfiguredParserLimit_RejectsBeforeExecution_AndRecovers(Gob16ParserLimit limit)
    {
        (string attack, string message) = limit switch
        {
            Gob16ParserLimit.Fields => (Aliases("gob16Ping", 9),
                "The GraphQL request document contains more than 8 fields. Parsing aborted."),
            Gob16ParserLimit.Nodes => (Values(64),
                "Document contains more than 32 nodes. Parsing aborted."),
            Gob16ParserLimit.Tokens => (Aliases("gob16Ping", 32),
                "Document contains more than 64 tokens. Parsing aborted."),
            _ => throw new ArgumentOutOfRangeException(nameof(limit))
        };
        var rejectedProbe = new Gob16Probe();
        await using (var rejected = await fixture.ExecuteAsync(attack, rejectedProbe, limit))
        {
            IError error = Rejection(rejected, rejectedProbe);
            Assert.Equal("HC0014", error.Code);
            Assert.Equal(message, error.Message);
        }
        var controlProbe = new Gob16Probe();
        // The exact same document passes when this one limit is restored to its real default.
        await using (var control = await fixture.ExecuteAsync(attack, controlProbe))
        {
            using var json = Success(control);
            Assert.NotEmpty(controlProbe.Calls);
            if (limit == Gob16ParserLimit.Nodes)
                Assert.Equal(64, json.RootElement.GetProperty("data").GetProperty("gob16Echo").GetInt32());
            else
                Assert.Equal(limit == Gob16ParserLimit.Fields ? 9 : 32,
                    json.RootElement.GetProperty("data").EnumerateObject().Count());
        }
        var recoveredProbe = new Gob16Probe();
        await using var recovered = await fixture.ExecuteAsync("{ gob16Ping }", recoveredProbe, limit);
        using var recoveredJson = Success(recovered);
        Assert.Equal("pong", recoveredJson.RootElement.GetProperty("data").GetProperty("gob16Ping").GetString());
        Assert.Single(recoveredProbe.Calls);
        fixture.AssertNoDatabaseAccess();
    }

    [Fact]
    public async Task FieldBoundary8_IsAccepted_Field9IsCoveredByParserLimitTheory()
    {
        var probe = new Gob16Probe();
        await using var result = await fixture.ExecuteAsync(Aliases("gob16Ping", 8), probe, Gob16ParserLimit.Fields);
        using var json = Success(result);
        Assert.Equal(8, json.RootElement.GetProperty("data").EnumerateObject().Count());
        Assert.Equal(8, probe.Calls.Count);
        fixture.AssertNoDatabaseAccess();
    }

    [Fact]
    public async Task ActualDefaultParserCaps_Reject20001FieldsEvenWhenTypenameHasNegligibleCost()
    {
        // Flat, bounded input. No recursive parser crash payloads are executed.
        string document = "{ probe:gob16Ping " + string.Join(' ',
            Enumerable.Range(0, 20_000).Select(i => $"a{i}:__typename")) + " }";
        var probe = new Gob16Probe();
        await using var result = await fixture.ExecuteAsync(document, probe);
        IError error = Rejection(result, probe);
        Assert.Equal("HC0014", error.Code);
        Assert.Contains(error.Message, new[]
        {
            "The GraphQL request document contains more than 20000 fields. Parsing aborted.",
            "Document contains more than 50000 nodes. Parsing aborted."
        });
        fixture.AssertNoDatabaseAccess();
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task UnexpectedResolverFailure_IsSanitizedEvenWithExceptionDetailsEnabled(bool persistenceFailure)
    {
        Exception failure = persistenceFailure
            ? new DbUpdateException(Gob16Probe.Sensitive, new InvalidOperationException(Gob16Probe.Sensitive))
            : new InvalidOperationException(Gob16Probe.Sensitive);
        var probe = new Gob16Probe { Failure = failure };
        int loggedBefore = fixture.ErrorLogger.Invocations.Count;
        await using var result = await fixture.ExecuteAsync("{ ok:gob16Ping broken:gob16Boom }", probe);
        IOperationResult operation = result.ExpectOperationResult();
        IError error = Assert.Single(operation.Errors!);
        Assert.Equal(SafeMessage, error.Message);
        Assert.Equal("INTERNAL_ERROR", error.Code);
        Assert.Null(error.Exception);
        Assert.Equal("broken", Assert.Single(error.Path!.ToList()));
        Assert.Single(error.Extensions!);
        Assert.Equal("INTERNAL_ERROR", error.Extensions!["code"]);
        Assert.Single(error.Locations!);
        using var json = JsonDocument.Parse(result.ToJson());
        Assert.Equal("pong", json.RootElement.GetProperty("data").GetProperty("ok").GetString());
        Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("data").GetProperty("broken").ValueKind);
        Assert.Equal(2, probe.Calls.Count);
        string wire = json.RootElement.GetRawText();
        foreach (string forbidden in new[] { Gob16Probe.Sensitive, "DbUpdateException", "InvalidOperationException",
                     "stackTrace", "exception", "dbo.", "PasswordHash", "fixture-sql", "connectionString" })
            Assert.DoesNotContain(forbidden, wire, StringComparison.OrdinalIgnoreCase);
        var invocation = Assert.Single(fixture.ErrorLogger.Invocations.Skip(loggedBefore));
        Assert.Equal("Log", invocation.Method.Name);
        Assert.Equal(LogLevel.Error, invocation.Arguments[0]);
        Assert.Same(failure, invocation.Arguments[3]);
        fixture.AssertNoDatabaseAccess();
    }

    [Fact]
    public void ErrorFilter_RebuildsErrorWithoutUntrustedExtensionsOrException()
    {
        var logger = new Mock<ILogger<GraphQLErrorFilter>>();
        var originalException = new InvalidOperationException(Gob16Probe.Sensitive);
        IError original = ErrorBuilder.New().SetMessage(Gob16Probe.Sensitive).SetCode("SQL_INTERNAL")
            .SetException(originalException).SetExtension("stackTrace", Gob16Probe.Sensitive)
            .SetExtension("connectionString", Gob16Probe.Sensitive).SetPath(HotChocolate.Path.Root.Append("broken"))
            .AddLocation(2, 3).Build();
        IError sanitized = new GraphQLErrorFilter(logger.Object).OnError(original);
        Assert.Equal(SafeMessage, sanitized.Message);
        Assert.Equal("INTERNAL_ERROR", sanitized.Code);
        Assert.Null(sanitized.Exception);
        Assert.Equal(original.Path, sanitized.Path);
        Assert.Equal(original.Locations, sanitized.Locations);
        Assert.Equal("code", Assert.Single(sanitized.Extensions!).Key);
        Assert.Equal("INTERNAL_ERROR", sanitized.Extensions!["code"]);
        Assert.Single(logger.Invocations);
    }

    [Fact]
    public void ErrorFilter_PreservesControlledValidationErrors()
    {
        IError original = ErrorBuilder.New().SetMessage("La operación solicitada no es válida.")
            .SetCode("VALIDATION_ERROR").Build();
        var logger = new Mock<ILogger<GraphQLErrorFilter>>(MockBehavior.Strict);
        Assert.Same(original, new GraphQLErrorFilter(logger.Object).OnError(original));
        logger.VerifyNoOtherCalls();
    }

    [Theory]
    [InlineData("query { gob16Ping ", true)]
    [InlineData("{ gob16Ping( }", true)]
    [InlineData("{ gob16Echo(values: [1 2) }", true)]
    [InlineData("{ gob16Unknown }", false)]
    public async Task MalformedOrUnknownFields_DoNotExecuteResolvers_AndLeaveExecutorUsable(
        string document, bool syntaxError)
    {
        for (int attempt = 0; attempt < 4; attempt++)
        {
            // Distinct documents avoid treating a cached validation result as a fresh parser check.
            var probe = new Gob16Probe();
            await using var result = await fixture.ExecuteAsync($"# attempt {attempt}\n{document}", probe);
            IError error = Rejection(result, probe);
            if (syntaxError) Assert.Equal("HC0014", error.Code);
            else
                Assert.Equal("The field `gob16Unknown` does not exist on the type `Query`.", error.Message);
            Assert.NotEqual("INTERNAL_ERROR", error.Code);
        }
        var recoveredProbe = new Gob16Probe();
        await using var recovered = await fixture.ExecuteAsync("{ gob16Ping }", recoveredProbe);
        using var json = Success(recovered);
        Assert.Equal("pong", json.RootElement.GetProperty("data").GetProperty("gob16Ping").GetString());
        Assert.Single(recoveredProbe.Calls);
        fixture.AssertNoDatabaseAccess();
    }

    [Fact]
    [Trait("Category", "VendorAdvisoryGHSA")]
    public void Parser_RequiresIndependentRecursionGuard_GHSA_qr3m_xw4c_jqw3()
    {
        // Expected RED on pinned HC 14.2.0. Metadata check only: never crash the testhost.
        // Vendor v14 fix: 14.3.1. Property presence is a necessary capability, not proof of its behavior.
        PropertyInfo? guard = typeof(ParserOptions).GetProperty("MaxAllowedRecursionDepth");
        Assert.True(guard is not null,
            "GHSA-qr3m-xw4c-jqw3: HC 14.2.0 lacks a parser recursion guard. Review vendor fix 14.3.1+.");
    }

    private static IError Rejection(IExecutionResult result, Gob16Probe probe)
    {
        IOperationResult operation = result.ExpectOperationResult();
        Assert.Null(operation.Data);
        Assert.Empty(probe.Calls);
        IError? depthError = operation.Errors?.FirstOrDefault(e => e.Message.Contains("execution depth", StringComparison.OrdinalIgnoreCase));
        if (depthError != null) return depthError;
        return Assert.Single(operation.Errors!);
    }

    private static JsonDocument Success(IExecutionResult result)
    {
        Assert.Null(result.ExpectOperationResult().Errors);
        Assert.NotNull(result.ExpectOperationResult().Data);
        return JsonDocument.Parse(result.ToJson());
    }

    private static string Nested(int depth)
    {
        string selection = "value";
        for (int level = 2; level < depth; level++) selection = $"next {{ {selection} }}";
        return $"{{ gob16Node {{ {selection} }} }}";
    }

    private static string Aliases(string field, int count) =>
        "{ " + string.Join(' ', Enumerable.Range(0, count).Select(index => $"a{index}:{field}")) + " }";

    private static string Values(int count) =>
        "{ gob16Echo(values:[" + string.Join(' ', Enumerable.Repeat("1", count)) + "]) }";
}

public enum Gob16ParserLimit { Defaults, Fields, Nodes, Tokens }

internal sealed class Gob16Probe
{
    public const string Key = "gob16.probe";
    public const string Sensitive =
        "GOB16_SECRET_SENTINEL dbo.Accounts PasswordHash fixture-sql connectionString EF.InternalClass";
    public ConcurrentQueue<string> Calls { get; } = new();
    public Exception Failure { get; init; } = new InvalidOperationException(Sensitive);
}

public sealed class GraphQLSecurityHardeningFixture : IAsyncLifetime
{
    private readonly Dictionary<Gob16ParserLimit, (ServiceProvider Provider, IRequestExecutor Executor)> executors = [];
    private readonly Mock<IDbContextFactory<OneItbContext>> database = new(MockBehavior.Strict);
    public Mock<ILogger<GraphQLErrorFilter>> ErrorLogger { get; } = new();

    public async Task InitializeAsync() => await GetExecutorAsync(Gob16ParserLimit.Defaults);

    internal async Task<IExecutionResult> ExecuteAsync(string document, Gob16Probe probe,
        Gob16ParserLimit limit = Gob16ParserLimit.Defaults)
    {
        IRequestExecutor executor = await GetExecutorAsync(limit);
        var request = OperationRequestBuilder.New().SetDocument(document)
            .SetGlobalState(Gob16Probe.Key, probe).Build();
        return await executor.ExecuteAsync(request);
    }

    public void AssertNoDatabaseAccess() => database.VerifyNoOtherCalls();

    private async Task<IRequestExecutor> GetExecutorAsync(Gob16ParserLimit limit)
    {
        if (executors.TryGetValue(limit, out var existing)) return existing.Executor;
        var values = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "GOB16-fixture-only-abcdefghijklmnopqrstuvwxyz-0123456789",
            ["Jwt:Issuer"] = "https://fixture.invalid",
            ["Jwt:Audience"] = "https://fixture.invalid",
            ["FileStorage:Provider"] = "Cloudinary",
            ["CloudinarySettings:Url"] = "cloudinary://fixture:fixture@fixture.invalid",
            // Stronger than production: sanitization must survive debug detail emission.
            ["GraphQL:IncludeExceptionDetails"] = "true",
            ["EmployerOnboarding:Enabled"] = "false",
            ["UploadCleanup:Enabled"] = "false"
        };
        if (limit != Gob16ParserLimit.Defaults)
        {
            string key = limit switch
            {
                Gob16ParserLimit.Fields => "GraphQL:MaxAllowedFields",
                Gob16ParserLimit.Nodes => "GraphQL:MaxAllowedNodes",
                Gob16ParserLimit.Tokens => "GraphQL:MaxAllowedTokens",
                _ => throw new ArgumentOutOfRangeException(nameof(limit))
            };
            values[key] = limit == Gob16ParserLimit.Fields ? "8" :
                limit == Gob16ParserLimit.Nodes ? "32" : "64";
        }
        IConfiguration configuration = new ConfigurationBuilder().AddInMemoryCollection(values).Build();
        var environment = new Mock<IWebHostEnvironment>();
        environment.SetupGet(x => x.EnvironmentName).Returns("Testing");
        environment.SetupGet(x => x.ApplicationName).Returns(typeof(Startup).Assembly.GetName().Name!);
        environment.SetupGet(x => x.ContentRootPath).Returns(AppContext.BaseDirectory);
        environment.SetupGet(x => x.WebRootPath).Returns(AppContext.BaseDirectory);
        environment.SetupGet(x => x.ContentRootFileProvider).Returns(new NullFileProvider());
        environment.SetupGet(x => x.WebRootFileProvider).Returns(new NullFileProvider());
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton(configuration);
        services.AddSingleton(environment.Object);
        services.AddSingleton<IHostEnvironment>(environment.Object);
        // Keep the real production registration, including depth/parser/cost/filter middleware.
        // Testing avoids Development key-directory writes; no host/server or workers are started.
        new Startup(configuration, environment.Object).ConfigureServices(services);
        services.RemoveAll<IDbContextFactory<OneItbContext>>();
        services.AddSingleton(database.Object);
        services.AddSingleton(ErrorLogger.Object);
        services.AddGraphQL().AddType<Gob16NodeAltType>().AddTypeExtension(new ObjectTypeExtension(d =>
        {
            d.Name("Query");
            d.Field("gob16Ping").Type<StringType>().Cost(0).Resolve(ctx => Record(ctx, "ping", "pong"));
            d.Field("gob16Expensive").Type<IntType>().Cost(10_000).Resolve(ctx => Record(ctx, "expensive", 42));
            d.Field("gob16Node").Type<Gob16NodeType>().Cost(0).Resolve(ctx => Record(ctx, "node", new object()));
            d.Field("gob16Costly").Type<Gob16CostlyType>().Cost(0).Resolve(ctx => Record(ctx, "costly", new object()));
            d.Field("gob16Echo").Type<IntType>().Cost(0)
                .Argument("values", a => a.Type<NonNullType<ListType<NonNullType<IntType>>>>())
                .Resolve(ctx => Record(ctx, "echo", ctx.ArgumentValue<int[]>("values").Length));
            d.Field("gob16Boom").Type<StringType>().Cost(0).Resolve(ctx =>
            {
                Gob16Probe probe = ctx.GetGlobalState<Gob16Probe>(Gob16Probe.Key);
                probe.Calls.Enqueue("boom");
                throw probe.Failure;
            });
        }));
        ServiceProvider provider = services.BuildServiceProvider();
        try
        {
            IRequestExecutor executor = await provider.GetRequiredService<IRequestExecutorResolver>()
                .GetRequestExecutorAsync();
            executors.Add(limit, (provider, executor));
            AssertNoDatabaseAccess();
            return executor;
        }
        catch { await provider.DisposeAsync(); throw; }
    }

    private static object Record(IResolverContext context, string field, object value)
    {
        context.GetGlobalState<Gob16Probe>(Gob16Probe.Key).Calls.Enqueue(field);
        return value;
    }

    public async Task DisposeAsync()
    {
        foreach (var entry in executors.Values) await entry.Provider.DisposeAsync();
    }

    public sealed class Gob16NodeType : ObjectType
    {
        protected override void Configure(IObjectTypeDescriptor d)
        {
            d.Name("Gob16Node");
            d.Field("next").Type<Gob16NodeAltType>().Cost(0).Resolve(ctx => Record(ctx, "next", new object()));
            d.Field("value").Type<IntType>().Cost(0).Resolve(ctx => Record(ctx, "value", 42));
        }
    }

    public sealed class Gob16NodeAltType : ObjectType
    {
        protected override void Configure(IObjectTypeDescriptor d)
        {
            d.Name("Gob16NodeAlt");
            d.Field("next").Type<Gob16NodeType>().Cost(0).Resolve(ctx => Record(ctx, "next", new object()));
            d.Field("value").Type<IntType>().Cost(0).Resolve(ctx => Record(ctx, "value", 42));
        }
    }

    public sealed class Gob16CostlyType : ObjectType
    {
        protected override void Configure(IObjectTypeDescriptor d)
        {
            d.Name("Gob16Costly").Cost(10_000);
            d.Field("value").Type<IntType>().Cost(0).Resolve(ctx => Record(ctx, "costly.value", 42));
        }
    }
}
