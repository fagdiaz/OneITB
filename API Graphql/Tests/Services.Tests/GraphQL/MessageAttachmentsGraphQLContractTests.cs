using System.Security.Claims;
using System.Text.Json;
using HotChocolate;
using HotChocolate.Execution;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Moq;
using OneItb.Data;
using OneItb.Entities.Models;
using OneItb.GraphQL;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.GraphQL;

public sealed class MessageAttachmentsGraphQLContractTests
{
    [Fact]
    public async Task StartupSchema_ExposesMessageAttachmentsAndProjectsConversationWithAttachments()
    {
        string dbName = $"oneitb-msg-att-gql-{Guid.NewGuid():N}";
        string contentRoot = System.IO.Path.Combine(
            System.IO.Path.GetTempPath(),
            $"oneitb-msg-schema-{Guid.NewGuid():N}");
        Directory.CreateDirectory(contentRoot);

        try
        {
            await using ServiceProvider provider = BuildStartupProvider(
                dbName,
                contentRoot,
                ServiceTestData.StudentUserId);

            await SeedConversationWithAttachmentAsync(provider);

            IRequestExecutor executor = await provider
                .GetRequiredService<IRequestExecutorResolver>()
                .GetRequestExecutorAsync();

            // 1. Verify GraphQL schema exposes Message.attachments with PrivateMessageAttachment shape
            IExecutionResult introspection = await executor.ExecuteAsync("""
                query {
                  msgType: __type(name: "Message") {
                    fields { name }
                  }
                  attType: __type(name: "PrivateMessageAttachment") {
                    fields { name }
                  }
                }
                """);

            string introspectionJson = introspection.ExpectOperationResult().ToJson();
            using (JsonDocument doc = JsonDocument.Parse(introspectionJson))
            {
                JsonElement data = doc.RootElement.GetProperty("data");
                var msgFields = data.GetProperty("msgType")
                    .GetProperty("fields")
                    .EnumerateArray()
                    .Select(item => item.GetProperty("name").GetString())
                    .ToHashSet(StringComparer.Ordinal);
                var attFields = data.GetProperty("attType")
                    .GetProperty("fields")
                    .EnumerateArray()
                    .Select(item => item.GetProperty("name").GetString())
                    .ToHashSet(StringComparer.Ordinal);

                Assert.Contains("attachments", msgFields);
                Assert.Contains("id", attFields);
                Assert.Contains("name", attFields);
                Assert.Contains("contentType", attFields);
                Assert.Contains("size", attFields);
                Assert.DoesNotContain("storageKey", attFields);
                Assert.DoesNotContain("uploadId", attFields);
            }

            // 2. Execute real Conversation query with [UsePaging] + [UseProjection]
            IExecutionResult conversationResult = await executor.ExecuteAsync(
                OperationRequestBuilder.New()
                    .SetDocument("""
                        query Conversation($otherUserId: UUID!, $first: Int) {
                          conversation(otherUserId: $otherUserId, first: $first) {
                            nodes {
                              id
                              content
                              attachments {
                                id
                                name
                                contentType
                                size
                              }
                            }
                          }
                        }
                        """)
                    .SetVariableValues(new Dictionary<string, object?>
                    {
                        ["otherUserId"] = ServiceTestData.TeacherUserId,
                        ["first"] = 10
                    })
                    .AddGlobalState("ClaimsPrincipal", CreateUserPrincipal(ServiceTestData.StudentUserId))
                    .Build());

            string conversationJson = conversationResult.ExpectOperationResult().ToJson();
            Assert.DoesNotContain("\"errors\"", conversationJson, StringComparison.Ordinal);
            Assert.Contains("guia-practica.pdf", conversationJson, StringComparison.Ordinal);
            Assert.Contains("application/pdf", conversationJson, StringComparison.Ordinal);
            Assert.Contains("4096", conversationJson, StringComparison.Ordinal);
        }
        finally
        {
            if (Directory.Exists(contentRoot))
                Directory.Delete(contentRoot, recursive: true);
        }
    }

    [Fact]
    public async Task SendPrivateMessage_GraphQLMutation_ReturnsPersistedAttachments()
    {
        string dbName = $"oneitb-msg-mut-gql-{Guid.NewGuid():N}";
        string contentRoot = System.IO.Path.Combine(
            System.IO.Path.GetTempPath(),
            $"oneitb-msg-mut-{Guid.NewGuid():N}");
        Directory.CreateDirectory(contentRoot);

        try
        {
            await using ServiceProvider provider = BuildStartupProvider(
                dbName,
                contentRoot,
                ServiceTestData.StudentUserId);

            Guid uploadId = await SeedPrivateUploadAsync(provider, ServiceTestData.StudentUserId);

            IRequestExecutor executor = await provider
                .GetRequiredService<IRequestExecutorResolver>()
                .GetRequestExecutorAsync();

            IExecutionResult mutationResult = await executor.ExecuteAsync(
                OperationRequestBuilder.New()
                    .SetDocument("""
                        mutation SendPrivateMessage($input: PrivateMessageInput!) {
                          sendPrivateMessage(input: $input) {
                            id
                            content
                            attachments {
                              id
                              name
                              contentType
                              size
                            }
                          }
                        }
                        """)
                    .SetVariableValues(new Dictionary<string, object?>
                    {
                        ["input"] = new Dictionary<string, object?>
                        {
                            ["receiverId"] = ServiceTestData.TeacherUserId,
                            ["clientMessageId"] = Guid.NewGuid(),
                            ["content"] = "Adjunto por GraphQL",
                            ["uploadIds"] = new[] { uploadId }
                        }
                    })
                    .AddGlobalState("ClaimsPrincipal", CreateUserPrincipal(ServiceTestData.StudentUserId))
                    .Build());

            string mutationJson = mutationResult.ExpectOperationResult().ToJson();
            Assert.DoesNotContain("\"errors\"", mutationJson, StringComparison.Ordinal);
            Assert.Contains("Adjunto por GraphQL", mutationJson, StringComparison.Ordinal);
            Assert.Contains("entrega.pdf", mutationJson, StringComparison.Ordinal);
            Assert.Contains("2048", mutationJson, StringComparison.Ordinal);
        }
        finally
        {
            if (Directory.Exists(contentRoot))
                Directory.Delete(contentRoot, recursive: true);
        }
    }

    private static ServiceProvider BuildStartupProvider(
        string dbName,
        string contentRoot,
        Guid authenticatedUserId)
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

        var environment = new Mock<IWebHostEnvironment>();
        environment.SetupGet(item => item.EnvironmentName).Returns(Environments.Development);
        environment.SetupGet(item => item.ApplicationName).Returns(typeof(Startup).Assembly.GetName().Name!);
        environment.SetupGet(item => item.ContentRootPath).Returns(contentRoot);
        environment.SetupGet(item => item.WebRootPath).Returns(System.IO.Path.Combine(contentRoot, "wwwroot"));

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton(configuration);
        services.AddSingleton(environment.Object);
        services.AddSingleton<IHostEnvironment>(environment.Object);

        new Startup(configuration, environment.Object).ConfigureServices(services);

        services.RemoveAll<IDbContextFactory<OneItbContext>>();
        services.RemoveAll<OneItbContext>();
        services.RemoveAll<DbContextOptions<OneItbContext>>();
        services.AddPooledDbContextFactory<OneItbContext>(options =>
            options.UseInMemoryDatabase(dbName)
                .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning)));
        services.AddScoped<OneItbContext>(p => p.GetRequiredService<IDbContextFactory<OneItbContext>>().CreateDbContext());

        var httpContext = new DefaultHttpContext
        {
            User = CreateUserPrincipal(authenticatedUserId)
        };
        var httpContextAccessor = new HttpContextAccessor { HttpContext = httpContext };
        services.RemoveAll<IHttpContextAccessor>();
        services.AddSingleton<IHttpContextAccessor>(httpContextAccessor);

        return services.BuildServiceProvider();
    }

    private static ClaimsPrincipal CreateUserPrincipal(Guid userId)
    {
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, "Estudiante")
        }, "TestAuth");
        return new ClaimsPrincipal(identity);
    }

    private static async Task SeedConversationWithAttachmentAsync(ServiceProvider provider)
    {
        using IServiceScope scope = provider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<OneItbContext>();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var upload = new PrivateUpload
        {
            Id = Guid.NewGuid(),
            OwnerId = ServiceTestData.StudentUserId,
            StorageKey = "private/guia-practica.pdf",
            FileName = "guia-practica.pdf",
            ContentType = "application/pdf",
            ByteSize = 4096,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(2),
            IsConsumed = true
        };

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ClientMessageId = Guid.NewGuid(),
            SenderId = ServiceTestData.StudentUserId,
            ReceiverId = ServiceTestData.TeacherUserId,
            Content = "Te paso la guia",
            SentAt = DateTime.UtcNow
        };

        var attachment = new MessageAttachment
        {
            Id = Guid.NewGuid(),
            MessageId = message.Id,
            UploadId = upload.Id,
            OrderIndex = 0,
            FileName = "guia-practica.pdf",
            ContentType = "application/pdf",
            ByteSize = 4096,
            Message = message,
            Upload = upload
        };

        context.PrivateUploads.Add(upload);
        context.Messages.Add(message);
        context.MessageAttachments.Add(attachment);
        await context.SaveChangesAsync();
    }

    private static async Task<Guid> SeedPrivateUploadAsync(ServiceProvider provider, Guid ownerId)
    {
        using IServiceScope scope = provider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<OneItbContext>();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var upload = new PrivateUpload
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            StorageKey = "private/entrega.pdf",
            FileName = "entrega.pdf",
            ContentType = "application/pdf",
            ByteSize = 2048,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(2),
            IsConsumed = false
        };

        context.PrivateUploads.Add(upload);
        await context.SaveChangesAsync();
        return upload.Id;
    }
}
