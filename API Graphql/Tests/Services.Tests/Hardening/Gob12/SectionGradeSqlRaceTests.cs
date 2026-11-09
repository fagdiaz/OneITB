using System.Security.Claims;
using HotChocolate;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Moq;
using OneITB.GraphQL.Mutations;
using OneItb.Entities.Models;
using Services.Academic;
using Services.Notifications;
using Services.Siu;
using Xunit;

namespace Services.Tests.Hardening.Gob12;

[Trait("Category", "GOB12SqlConcurrency")]
public sealed class SectionGradeSqlRaceTests : IClassFixture<Gob12SqlFixture>
{
    private readonly Gob12SqlFixture database;
    public SectionGradeSqlRaceTests(Gob12SqlFixture database) => this.database = database;

    private static Mock<INotificationService> Notifications()
    {
        var mock = new Mock<INotificationService>(MockBehavior.Strict);
        mock.Setup(service => service.CreateNotificationsAsync(
            It.IsAny<IReadOnlyCollection<Guid>>(), NotificationType.AcademicProgress,
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Notification>());
        return mock;
    }

    private static IHttpContextAccessor Actor(Guid id, string role)
    {
        var context = new DefaultHttpContext {
            User = new ClaimsPrincipal(new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.NameIdentifier, id.ToString()),
                new Claim(ClaimTypes.Role, role),
            }, "GOB12")),
        };
        return Mock.Of<IHttpContextAccessor>(accessor => accessor.HttpContext == context);
    }

    private async Task<SectionGrade> SeedGradeAsync()
    {
        await using var context = database.Open();
        // This fixture owns the entire disposable database.
        await context.SectionGrades.ExecuteDeleteAsync();
        await context.AcademicProgressRecords.ExecuteDeleteAsync();
        var grade = new SectionGrade {
            Id = Guid.NewGuid(), SectionId = database.SectionId, StudentId = database.Sender,
            AssignedById = database.Receiver, Score = 5m, Status = AcademicProgressStatus.Regular,
        };
        context.SectionGrades.Add(grade);
        context.AcademicProgressRecords.Add(new AcademicProgress {
            Id = Guid.NewGuid(), SubjectId = database.SubjectId, UserId = database.Sender,
            AssignedById = database.Receiver, Score = grade.Score, Status = grade.Status,
        });
        await context.SaveChangesAsync();
        var property = context.Model.FindEntityType(typeof(SectionGrade))!
            .FindProperty(nameof(SectionGrade.RowVersion))!;
        Assert.True(property.IsConcurrencyToken);
        Assert.Equal(ValueGenerated.OnAddOrUpdate, property.ValueGenerated);
        Assert.Equal(8, grade.RowVersion.Length); // SQL Server's generated token, never a mocked GUID.
        return grade;
    }

    private Task<SectionGrade> SaveThroughResolver(Gob12Context context,
        Mock<INotificationService> notifications, Guid actor, string role,
        decimal score, string expected, CancellationToken cancellationToken)
    {
        var service = new AcademicService(context, notifications.Object,
            new Mock<ISiuIntegrationService>(MockBehavior.Strict).Object);
        return new Mutation().SaveSectionGrade(
            new SectionGradeInput(database.SectionId, database.Sender, score,
                AcademicProgressStatus.Approved, expected),
            service, Actor(actor, role), cancellationToken);
    }

    private async Task AssertWinnerAsync(SectionGrade winner, byte[] originalVersion)
    {
        await using var verification = database.Open();
        var stored = Assert.Single(await verification.SectionGrades.AsNoTracking()
            .Where(row => row.SectionId == database.SectionId && row.StudentId == database.Sender).ToListAsync());
        Assert.Equal(winner.Id, stored.Id);
        Assert.Equal(winner.Score, stored.Score);
        Assert.Equal(winner.AssignedById, stored.AssignedById);
        Assert.Equal(winner.Status, stored.Status);
        Assert.False(originalVersion.SequenceEqual(stored.RowVersion));
        var summary = await verification.AcademicProgressRecords.AsNoTracking()
            .SingleAsync(row => row.UserId == database.Sender && row.SubjectId == database.SubjectId);
        Assert.Equal(stored.Score, summary.Score);
        Assert.Equal(stored.AssignedById, summary.AssignedById);
        Assert.Equal(stored.Status, summary.Status);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task CurrentVersionAndAlreadyStaleVersion_OnlyCurrentWriterPersists(bool secondIsAdmin)
    {
        var seed = await SeedGradeAsync();
        var stale = Convert.ToBase64String(seed.RowVersion);
        await using (var advance = database.Open())
        {
            var row = await advance.SectionGrades.SingleAsync(grade => grade.Id == seed.Id);
            row.Score = 6m;
            await advance.SaveChangesAsync();
        }
        await using var first = database.Open();
        await using var second = database.Open();
        var current = await first.SectionGrades.AsNoTracking().SingleAsync(grade => grade.Id == seed.Id);
        Assert.NotEqual(stale, Convert.ToBase64String(current.RowVersion));
        var notifications = Notifications();
        var start = new Gob12PairGate();
        using var deadline = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        async Task<Gob12Outcome<SectionGrade>> Send(Gob12Context context, Guid actor, string role,
            decimal score, string version)
        {
            await start.ArriveAsync(deadline.Token);
            return await Gob12Outcome<SectionGrade>.Capture(() =>
                SaveThroughResolver(context, notifications, actor, role, score, version, deadline.Token));
        }
        var results = await Task.WhenAll(
            Task.Run(() => Send(first, database.Receiver, "Profesor", 8m, Convert.ToBase64String(current.RowVersion))),
            Task.Run(() => Send(second, secondIsAdmin ? database.Admin : database.SecondProfessor,
                secondIsAdmin ? "Administrador" : "Profesor", 9m, stale)));
        Assert.Equal(2, start.Arrivals);
        Assert.Null(results[0].Error);
        var error = Assert.IsType<GraphQLException>(results[1].Error);
        Assert.Contains("Conflicto de concurrencia", Assert.Single(error.Errors).Message);
        Assert.Equal(8m, results[0].Value!.Score);
        await AssertWinnerAsync(results[0].Value!, current.RowVersion);
        Assert.Single(notifications.Invocations);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task SameVersionBothValidated_BarrierBeforeSave_RowVersionRejectsLateWriter(bool secondIsAdmin)
    {
        var seed = await SeedGradeAsync();
        var version = Convert.ToBase64String(seed.RowVersion);
        var gate = new Gob12PairGate();
        await using var first = database.Open();
        await using var second = database.Open();
        first.SaveGate = gate;
        second.SaveGate = gate;
        var notifications = Notifications();
        using var deadline = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        var results = await Task.WhenAll(
            Task.Run(() => Gob12Outcome<SectionGrade>.Capture(() =>
                SaveThroughResolver(first, notifications, database.Receiver, "Profesor", 8m, version, deadline.Token))),
            Task.Run(() => Gob12Outcome<SectionGrade>.Capture(() =>
                SaveThroughResolver(second, notifications,
                    secondIsAdmin ? database.Admin : database.SecondProfessor,
                    secondIsAdmin ? "Administrador" : "Profesor", 9m, version, deadline.Token))));
        Assert.Equal(2, gate.Arrivals); // Both passed the service's version comparison.
        var winner = Assert.Single(results, result => result.Error == null).Value!;
        var error = Assert.IsType<GraphQLException>(Assert.Single(results, result => result.Error != null).Error);
        var detail = Assert.Single(error.Errors);
        Assert.Equal("CONCURRENCY_CONFLICT", detail.Code);
        Assert.Contains("Conflicto de concurrencia", detail.Message);
        await AssertWinnerAsync(winner, seed.RowVersion);
        Assert.Single(notifications.Invocations); // The rolled-back grade emits no notification.
    }

    [Fact]
    public async Task SqlControl_TwoTrackedCopies_RejectStaleUpdateAndPreserveWinningScore()
    {
        var seed = await SeedGradeAsync();
        await using var first = database.Open();
        await using var second = database.Open();
        var a = await first.SectionGrades.SingleAsync(row => row.Id == seed.Id);
        var b = await second.SectionGrades.SingleAsync(row => row.Id == seed.Id);
        Assert.Equal(a.RowVersion, b.RowVersion);
        a.Score = 8m;
        await first.SaveChangesAsync();
        b.Score = 9m;
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => second.SaveChangesAsync());
        await using var verification = database.Open();
        Assert.Equal(8m, (await verification.SectionGrades.AsNoTracking().SingleAsync(row => row.Id == seed.Id)).Score);
        Assert.Equal(8, a.RowVersion.Length);
        Assert.False(seed.RowVersion.SequenceEqual(a.RowVersion));
    }
}
