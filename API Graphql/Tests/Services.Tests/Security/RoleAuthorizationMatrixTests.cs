using System.Security.Claims;
using System.Text.Json;
using GraphQL.GraphQL;
using HotChocolate;
using HotChocolate.Execution;
using HotChocolate.Subscriptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using OneITB.Core.Services.Interfaces;
using OneITB.GraphQL.Mutations;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Academic;
using Services.EmployerOnboarding;
using Services.Jobs;
using Services.Moderation;
using Services.Notifications;
using Services.Repositories;
using Services.Siu;
using Services.Tests.TestSupport;
using Services.Users;
using Xunit;

namespace Services.Tests.Security;

public sealed class RoleAuthorizationMatrixTests
{
    public static readonly string[] Roles =
        ["Administrador", "Moderador", "Profesor", "Estudiante", "Egresado", "Empleador"];
    private static readonly Guid ActorId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    private static readonly Guid TargetId = Guid.Parse("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
    private static readonly Guid OwnerId = Guid.Parse("cccccccc-cccc-4ccc-8ccc-cccccccccccc");
    private static readonly Guid OwnOffer = Guid.Parse("dddddddd-dddd-4ddd-8ddd-dddddddddddd");
    private static readonly Guid OtherOffer = Guid.Parse("eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee");
    private static readonly Guid RequestId = Guid.Parse("11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    private static readonly Guid ReportId = Guid.Parse("22222222-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    private static readonly Guid SectionId = Guid.Parse("33333333-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    private static readonly Guid ApplicationId = Guid.Parse("44444444-aaaa-4aaa-8aaa-aaaaaaaaaaaa");

    // This is the acceptance policy from GOB13, deliberately independent of resolver attributes.
    // B2B creation/management is Employer-only in this policy. The current code also permits Admin.
    public static readonly string[] Operations = [
        "updateReportStatus", "saveSectionGrade", "createJobOffer", "myJobOffers", "applyToJob",
        "jobOffers", "approveEmployerRequest", "rejectEmployerRequest", "auditLogs",
        "updateUserRole", "updateUserStatus",
    ];
    private static bool Allowed(string role, string operation) => operation switch {
        "updateReportStatus" => role is "Administrador" or "Moderador",
        "saveSectionGrade" => role is "Administrador" or "Profesor",
        "createJobOffer" or "myJobOffers" => role is "Administrador" or "Empleador",
        "applyToJob" => role is "Estudiante" or "Egresado",
        "jobOffers" => true,
        _ => role == "Administrador",
    };

    public static IEnumerable<object[]> RoleCases() =>
        from role in Roles from operation in Operations select new object[] { role, operation, Allowed(role, operation) };
    public static IEnumerable<object[]> AnonymousCases() => Operations.Select(operation => new object[] { operation });
    public static IEnumerable<object[]> JobCases() =>
        from role in Roles from operation in new[] { "createJobOffer", "myJobOffers", "applyToJob", "updateOwnApplication" }
        select new object[] { role, operation };

    [Theory]
    [MemberData(nameof(RoleCases))]
    public async Task GraphQL_SixRolesCrossElevenOperations(string role, string operation, bool allowed)
    {
        await using var fixture = await Fixture.CreateAsync(role);
        var before = await fixture.SnapshotAsync();
        var request = OperationRequestBuilder.New().SetDocument(Document(operation))
            .SetUser(fixture.Principal).Build();
        await using var result = await fixture.Executor.ExecuteAsync(request);
        using var json = JsonDocument.Parse(result.ToJson());
        if (!allowed)
        {
            AssertDenial(result, json.RootElement, operation, role);
            Assert.Equal(before, await fixture.SnapshotAsync());
            Assert.Empty(fixture.Notifications.Invocations);
            Assert.Empty(fixture.Topics.Invocations);
            return;
        }

        Assert.False(json.RootElement.TryGetProperty("errors", out _), result.ToJson());
        var value = json.RootElement.GetProperty("data").GetProperty("r");
        Assert.NotEqual(JsonValueKind.Null, value.ValueKind);
        await fixture.AssertPositiveAsync(operation, value);
    }

    [Theory]
    [MemberData(nameof(AnonymousCases))]
    public async Task Anonymous_CannotReachAnyProtectedOperation(string operation)
    {
        await using var fixture = await Fixture.CreateAsync("Estudiante", authenticated: false);
        var before = await fixture.SnapshotAsync();
        await using var result = await fixture.Executor.ExecuteAsync(OperationRequestBuilder.New()
            .SetDocument(Document(operation)).SetUser(fixture.Principal).Build());
        using var json = JsonDocument.Parse(result.ToJson());
        var errors = json.RootElement.GetProperty("errors");
        Assert.Equal(1, errors.GetArrayLength());
        Assert.Equal("AUTH_NOT_AUTHENTICATED", errors[0].GetProperty("extensions").GetProperty("code").GetString());
        AssertNoProtectedValue(json.RootElement);
        Assert.Equal(before, await fixture.SnapshotAsync());
        Assert.Empty(fixture.Notifications.Invocations);
        Assert.Empty(fixture.Topics.Invocations);
    }

    [Theory]
    [MemberData(nameof(JobCases))]
    public async Task JobService_IndependentlyEnforcesRolesAndOwnership(string role, string operation)
    {
        await using var fixture = await Fixture.CreateAsync(role);
        var before = await fixture.SnapshotAsync();
        var allowed = operation == "updateOwnApplication" ? role is "Administrador" or "Empleador" : Allowed(role, operation);
        async Task<object> Execute()
        {
            return operation switch {
                "createJobOffer" => await fixture.Jobs.CreateJobOfferAsync(ActorId, role, "Matrix title", "Company", "Description", "Avellaneda"),
                "myJobOffers" => await fixture.Jobs.GetMyJobOffers(ActorId, role).ToListAsync(),
                "applyToJob" => await fixture.Jobs.ApplyToJobAsync(ActorId, role, OtherOffer),
                _ => await fixture.Jobs.UpdateApplicationStatusAsync(ActorId, role, ApplicationId, JobApplicationStatus.Reviewed),
            };
        }
        if (!allowed)
        {
            var error = await Assert.ThrowsAsync<InvalidOperationException>(Execute);
            Assert.Contains(operation == "applyToJob" ? "Solo estudiantes o egresados" : "Solo empleadores",
                error.Message, StringComparison.Ordinal);
            Assert.Equal(before, await fixture.SnapshotAsync());
            return;
        }
        Assert.NotNull(await Execute());
        if (operation == "updateOwnApplication")
            Assert.Equal(JobApplicationStatus.Reviewed,
                (await fixture.Context.JobApplications.AsNoTracking().SingleAsync(row => row.Id == ApplicationId)).Status);
    }

    [Theory]
    [InlineData("Administrador")]
    [InlineData("Empleador")]
    public async Task B2B_AcceptedRoleCannotChangeAnotherOwnersApplication(string role)
    {
        await using var fixture = await Fixture.CreateAsync(role);
        var before = await fixture.SnapshotAsync();
        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            fixture.Jobs.UpdateApplicationStatusAsync(OwnerId, role, ApplicationId, JobApplicationStatus.Reviewed));
        Assert.Contains("Solo el creador", error.Message, StringComparison.Ordinal);
        Assert.Equal(before, await fixture.SnapshotAsync());
    }

    [Fact]
    public async Task Professor_MustBeAssignedToTheExactSection()
    {
        await using var fixture = await Fixture.CreateAsync("Profesor");
        fixture.Context.SectionInstructors.RemoveRange(await fixture.Context.SectionInstructors.ToListAsync());
        await fixture.Context.SaveChangesAsync();
        var before = await fixture.SnapshotAsync();
        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            fixture.Academics.SaveSectionGradeAsync(ActorId, "Profesor",
                new SectionGradeInput(SectionId, TargetId, 8m, AcademicProgressStatus.Approved, null)));
        Assert.Contains("docente no está asignado", error.Message, StringComparison.Ordinal);
        Assert.Equal(before, await fixture.SnapshotAsync());
    }

    private static void AssertDenial(IExecutionResult result, JsonElement root, string operation, string role)
    {
        Assert.True(root.TryGetProperty("errors", out var errors),
            $"Expected authorization denial for {role}/{operation}, received {root.GetRawText()}");
        Assert.Equal(1, errors.GetArrayLength());
        AssertNoProtectedValue(root);
        if (operation == "myJobOffers" && role != "Administrador")
        {
            // This query uses [Authorize] plus JobService's role check.
            // Inspect the server-side exception so a schema/DI/database error cannot masquerade as a denial.
            var error = Assert.Single(result.ExpectOperationResult().Errors!);
            var exception = Assert.IsType<InvalidOperationException>(error.Exception);
            Assert.Equal("Solo empleadores o administradores pueden publicar ofertas laborales.", exception.Message);
        }
        else
        {
            Assert.Equal("AUTH_NOT_AUTHORIZED", errors[0].GetProperty("extensions").GetProperty("code").GetString());
        }
    }

    private static void AssertNoProtectedValue(JsonElement root)
    {
        if (root.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Object)
            Assert.True(!data.TryGetProperty("r", out var value) || value.ValueKind == JsonValueKind.Null);
    }

    private static string Document(string operation) => operation switch {
        "updateReportStatus" => $$"""mutation { r: updateReportStatus(reportId:"{{ReportId}}", status:"Reviewed") { id status } }""",
        "saveSectionGrade" => $$"""mutation { r: saveSectionGrade(input:{sectionId:"{{SectionId}}", studentId:"{{TargetId}}", score:8, status:APPROVED}) { id score } }""",
        "createJobOffer" => """mutation { r: createJobOffer(title:"Matrix title", company:"Company", description:"Description", location:"Avellaneda") { id } }""",
        "myJobOffers" => """query { r: myJobOffers(first:10) { nodes { id applications { id } } } }""",
        "applyToJob" => $$"""mutation { r: applyToJob(jobOfferId:"{{OtherOffer}}") { id applicantId } }""",
        "jobOffers" => """query { r: jobOffers(onlyActive:true, first:10) { nodes { id } } }""",
        "approveEmployerRequest" => $$"""mutation { r: approveEmployerRequest(requestId:"{{RequestId}}") { request { id status } accountCreated } }""",
        "rejectEmployerRequest" => $$"""mutation { r: rejectEmployerRequest(requestId:"{{RequestId}}", reason:"Verificación rechazada") { request { id status } } }""",
        "auditLogs" => """query { r: auditLogs(first:10) { id } }""",
        "updateUserRole" => $$"""mutation { r: updateUserRole(userId:"{{TargetId}}", newRole:"Profesor") { id success } }""",
        "updateUserStatus" => $$"""mutation { r: updateUserStatus(userId:"{{TargetId}}", isActive:false) { id success } }""",
        _ => throw new ArgumentOutOfRangeException(nameof(operation)),
    };

    private sealed class Fixture : IAsyncDisposable
    {
        public required OneItbContext Context { get; init; }
        public required ServiceProvider Provider { get; init; }
        public required IRequestExecutor Executor { get; init; }
        public required ClaimsPrincipal Principal { get; init; }
        public required JobService Jobs { get; init; }
        public required AcademicService Academics { get; init; }
        public required Mock<INotificationService> Notifications { get; init; }
        public required Mock<ITopicEventSender> Topics { get; init; }

        public static async Task<Fixture> CreateAsync(string role, bool authenticated = true)
        {
            var context = ServiceTestData.CreateContext();
            try
            {
                await ServiceTestData.SeedAcademicGraphAsync(context);
                var actor = ServiceTestData.CreateUser(ActorId, "Role", "Actor", role, true);
                var target = ServiceTestData.CreateUser(TargetId, "Target", "Student", "Estudiante", true);
                var owner = ServiceTestData.CreateUser(OwnerId, "Other", "Owner", "Empleador", true);
                context.Accounts.AddRange(
                    ServiceTestData.CreateAccount(actor, "actor@matrix.test"),
                    ServiceTestData.CreateAccount(target, "target@matrix.test"),
                    ServiceTestData.CreateAccount(owner, "owner@matrix.test"));
                // Historical ownership/instructor links remain after a role downgrade.
                // Keeping them for every role proves that role gates still apply.
                context.SectionInstructors.Add(new SectionInstructor { SectionId = SectionId, ProfessorId = ActorId });
                context.CourseSections.Add(new CourseSection { Id = SectionId, SubjectId = ServiceTestData.SubjectId, Code = "MATRIX", Term = "2026-2C" });
                context.SectionEnrollments.Add(new SectionEnrollment { SectionId = SectionId, StudentId = TargetId });
                context.JobOffers.AddRange(
                    Offer(OwnOffer, ActorId, true), Offer(OtherOffer, OwnerId, true),
                    Offer(Guid.NewGuid(), OwnerId, false));
                context.JobApplications.Add(new JobApplication {
                    Id = ApplicationId, JobOfferId = OwnOffer, ApplicantId = TargetId,
                    Status = JobApplicationStatus.Pending, AppliedAt = DateTime.UtcNow,
                });
                var inquiry = new Inquiry {
                    Id = Guid.NewGuid(), Title = "Matrix inquiry", Content = "Test", UserId = TargetId,
                    SubjectId = ServiceTestData.SubjectId, PublishDate = DateTime.UtcNow,
                };
                context.Inquiries.Add(inquiry);
                context.CommunityReports.Add(new CommunityReport {
                    Id = ReportId, InquiryId = inquiry.Id, ReporterId = TargetId, Reason = "Matrix", Status = "Pending",
                });
                context.EmployerRequests.Add(new EmployerRequest {
                    Id = RequestId, CompanyName = "Matrix Company", ContactName = "Matrix Contact",
                    Email = "new-company@matrix.test", Phone = "+5491122334455", TaxId = "30123456781",
                    Status = EmployerRequestStatus.Pending,
                });
                context.AuditLogs.Add(new AuditLog {
                    Id = Guid.NewGuid(), ActorUserId = ActorId, Action = "MatrixSeed", EntityName = "Fixture", EntityId = ActorId.ToString(),
                });
                await context.SaveChangesAsync();
                context.ChangeTracker.Clear();
                var principal = authenticated ? new ClaimsPrincipal(new ClaimsIdentity(new[] {
                    new Claim(ClaimTypes.NameIdentifier, ActorId.ToString()), new Claim(ClaimTypes.Role, role),
                }, "matrix")) : new ClaimsPrincipal(new ClaimsIdentity());
                var http = new DefaultHttpContext { User = principal };
                var accessor = Mock.Of<IHttpContextAccessor>(value => value.HttpContext == http);
                var notifications = new Mock<INotificationService>(MockBehavior.Strict);
                notifications.Setup(service => service.CreateNotificationsAsync(
                    It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<NotificationType>(),
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                    .ReturnsAsync(Array.Empty<Notification>());
                var topics = new Mock<ITopicEventSender>(MockBehavior.Strict);
                topics.Setup(sender => sender.SendAsync(It.IsAny<string>(), It.IsAny<JobOffer>(), It.IsAny<CancellationToken>()))
                    .Returns(ValueTask.CompletedTask);
                var academics = new AcademicService(context, notifications.Object, new Mock<ISiuIntegrationService>(MockBehavior.Strict).Object);
                var jobs = new JobService(context);
                var services = new ServiceCollection();
                services.AddLogging();
                services.AddAuthorization();
                services.AddSingleton(context);
                services.AddSingleton(accessor);
                services.AddSingleton<IAcademicService>(academics);
                services.AddSingleton<IJobService>(jobs);
                services.AddSingleton<INotificationService>(notifications.Object);
                services.AddSingleton<ITopicEventSender>(topics.Object);
                services.AddSingleton<IModerationService>(new ModerationService(context));
                services.AddSingleton<IEmployerRequestService>(new EmployerRequestService(context, TimeProvider.System));
                services.AddSingleton<IUsersService>(new UsersService(new UnitOfWork(context), context,
                    new Mock<IPasswordHasher>(MockBehavior.Strict).Object, new PublicRegistrationPolicy(),
                    new UserCareerAssignmentService(context)));
                services.AddGraphQLServer().AddAuthorization().AddProjections().AddFiltering().AddSorting()
                    .AddQueryType<Query>().AddMutationType<Mutation>();
                var provider = services.BuildServiceProvider();
                try
                {
                    var executor = await provider.GetRequiredService<IRequestExecutorResolver>().GetRequestExecutorAsync();
                    return new Fixture { Context = context, Provider = provider, Executor = executor, Principal = principal,
                        Jobs = jobs, Academics = academics, Notifications = notifications, Topics = topics };
                }
                catch { await provider.DisposeAsync(); throw; }
            }
            catch { await context.DisposeAsync(); throw; }
        }

        private static JobOffer Offer(Guid id, Guid owner, bool active) => new() {
            Id = id, EmployerId = owner, Title = "Matrix offer", Company = "Company", Description = "Description",
            Location = "Avellaneda", IsActive = active, CreatedAt = DateTime.UtcNow,
        };

        public async Task<string> SnapshotAsync()
        {
            return JsonSerializer.Serialize(new {
                Users = await Context.Users.AsNoTracking().OrderBy(row => row.Id).Select(row => new { row.Id, row.Role, row.IsActive }).ToArrayAsync(),
                Reports = await Context.CommunityReports.AsNoTracking().OrderBy(row => row.Id).Select(row => new { row.Id, row.Status }).ToArrayAsync(),
                Offers = await Context.JobOffers.AsNoTracking().OrderBy(row => row.Id).Select(row => new { row.Id, row.EmployerId }).ToArrayAsync(),
                Applications = await Context.JobApplications.AsNoTracking().OrderBy(row => row.Id).Select(row => new { row.Id, row.Status }).ToArrayAsync(),
                Grades = await Context.SectionGrades.AsNoTracking().OrderBy(row => row.Id).Select(row => new { row.Id, row.Score }).ToArrayAsync(),
                Progress = await Context.AcademicProgressRecords.AsNoTracking().OrderBy(row => row.Id).Select(row => new { row.Id, row.Score }).ToArrayAsync(),
                Requests = await Context.EmployerRequests.AsNoTracking().OrderBy(row => row.Id).Select(row => new { row.Id, row.Status }).ToArrayAsync(),
                Audits = await Context.AuditLogs.CountAsync(),
                ModerationAudits = await Context.ModerationAudits.CountAsync(),
                Outbox = await Context.EmployerOnboardingOutboxMessages.CountAsync(),
                Accounts = await Context.Accounts.CountAsync(),
            });
        }

        public async Task AssertPositiveAsync(string operation, JsonElement value)
        {
            switch (operation)
            {
                case "updateReportStatus":
                    Assert.Equal("Reviewed", (await Context.CommunityReports.AsNoTracking().SingleAsync(row => row.Id == ReportId)).Status);
                    Assert.Single(await Context.ModerationAudits.ToListAsync());
                    break;
                case "saveSectionGrade":
                    Assert.Equal(8m, (await Context.SectionGrades.AsNoTracking().SingleAsync()).Score);
                    Assert.Equal(8m, (await Context.AcademicProgressRecords.AsNoTracking().SingleAsync()).Score);
                    Assert.Single(Notifications.Invocations);
                    break;
                case "createJobOffer":
                    Assert.Equal(1, await Context.JobOffers.CountAsync(row => row.Title == "Matrix title" && row.EmployerId == ActorId));
                    Assert.Single(Topics.Invocations);
                    Assert.Single(Notifications.Invocations);
                    break;
                case "myJobOffers":
                    Assert.Equal(OwnOffer, value.GetProperty("nodes")[0].GetProperty("id").GetGuid());
                    Assert.Equal(1, value.GetProperty("nodes").GetArrayLength());
                    Assert.Equal(ApplicationId, value.GetProperty("nodes")[0].GetProperty("applications")[0].GetProperty("id").GetGuid());
                    break;
                case "applyToJob":
                    Assert.Equal(ActorId, value.GetProperty("applicantId").GetGuid());
                    Assert.Equal(1, await Context.JobApplications.CountAsync(row => row.JobOfferId == OtherOffer && row.ApplicantId == ActorId));
                    Assert.Single(Notifications.Invocations);
                    break;
                case "jobOffers":
                    Assert.Equal(new[] { OwnOffer, OtherOffer }.Order(),
                        value.GetProperty("nodes").EnumerateArray().Select(node => node.GetProperty("id").GetGuid()).Order());
                    break;
                case "approveEmployerRequest":
                    Assert.Equal(EmployerRequestStatus.Approved, (await Context.EmployerRequests.AsNoTracking().SingleAsync()).Status);
                    Assert.Single(await Context.EmployerOnboardingOutboxMessages.ToListAsync());
                    break;
                case "rejectEmployerRequest":
                    Assert.Equal(EmployerRequestStatus.Rejected, (await Context.EmployerRequests.AsNoTracking().SingleAsync()).Status);
                    Assert.Empty(await Context.EmployerOnboardingOutboxMessages.ToListAsync());
                    break;
                case "auditLogs": Assert.Equal(1, value.GetArrayLength()); break;
                case "updateUserRole": Assert.Equal("Profesor", (await Context.Users.AsNoTracking().SingleAsync(row => row.Id == TargetId)).Role); break;
                case "updateUserStatus": Assert.False((await Context.Users.AsNoTracking().SingleAsync(row => row.Id == TargetId)).IsActive); break;
                default: throw new ArgumentOutOfRangeException(nameof(operation));
            }
        }

        public async ValueTask DisposeAsync()
        {
            await Provider.DisposeAsync();
            await Context.DisposeAsync();
        }
    }
}
