using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;
using Services.Moderation;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Moderation;

public sealed class ModerationServiceTests
{
    [Fact]
    public async Task ModerateInquiryVisibilityAsync_HidesContentAndCreatesOneAudit()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var inquiry = new Inquiry
        {
            Id = Guid.NewGuid(),
            UserId = ServiceTestData.StudentUserId,
            SubjectId = ServiceTestData.SubjectId,
            Title = "Contenido reportado",
            Content = "Contenido a revisar",
            PublishDate = DateTime.UtcNow,
            IsActive = true
        };
        context.Inquiries.Add(inquiry);
        await context.SaveChangesAsync();
        var service = new ModerationService(context);

        await service.ModerateInquiryVisibilityAsync(
            ServiceTestData.AdminUserId,
            inquiry.Id,
            true,
            "Incumple las normas institucionales.");
        await service.ModerateInquiryVisibilityAsync(
            ServiceTestData.AdminUserId,
            inquiry.Id,
            true,
            "Solicitud repetida.");

        Assert.Empty(await context.Inquiries.AsNoTracking().ToListAsync());
        Inquiry hidden = await context.Inquiries.IgnoreQueryFilters().SingleAsync(item => item.Id == inquiry.Id);
        Assert.True(hidden.IsHiddenByModerator);
        ModerationAudit audit = Assert.Single(context.ModerationAudits);
        Assert.Equal("HideInquiry", audit.Action);
        Assert.Equal(ServiceTestData.AdminUserId, audit.ActorUserId);
    }

    [Fact]
    public async Task ModerateInquiryVisibilityAsync_RejectsNonModerator()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var inquiry = new Inquiry
        {
            Id = Guid.NewGuid(),
            UserId = ServiceTestData.TeacherUserId,
            SubjectId = ServiceTestData.SubjectId,
            Title = "Contenido valido",
            Content = "Sin cambios",
            PublishDate = DateTime.UtcNow,
            IsActive = true
        };
        context.Inquiries.Add(inquiry);
        await context.SaveChangesAsync();
        var service = new ModerationService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ModerateInquiryVisibilityAsync(
                ServiceTestData.StudentUserId,
                inquiry.Id,
                true,
                "Intento sin permisos."));

        Assert.False((await context.Inquiries.IgnoreQueryFilters().SingleAsync()).IsHiddenByModerator);
        Assert.Empty(context.ModerationAudits);
    }

    [Fact]
    public async Task ModerateInquiryVisibilityAsync_ModeratorCanHideAndRestoreWithAuditTrail()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var inquiry = new Inquiry
        {
            Id = Guid.NewGuid(),
            UserId = ServiceTestData.StudentUserId,
            SubjectId = ServiceTestData.SubjectId,
            Title = "Contenido bajo revision",
            Content = "Contenido preservado",
            PublishDate = DateTime.UtcNow,
            IsActive = true
        };
        context.Inquiries.Add(inquiry);
        await context.SaveChangesAsync();
        var service = new ModerationService(context);

        await service.ModerateInquiryVisibilityAsync(
            ServiceTestData.ModeratorUserId,
            inquiry.Id,
            true,
            "Reporte validado por moderacion.");
        await service.ModerateInquiryVisibilityAsync(
            ServiceTestData.ModeratorUserId,
            inquiry.Id,
            false,
            "Contenido restaurado tras revision.");

        context.ChangeTracker.Clear();
        Inquiry restored = await context.Inquiries
            .IgnoreQueryFilters()
            .SingleAsync(item => item.Id == inquiry.Id);
        ModerationAudit[] audits = await context.ModerationAudits
            .AsNoTracking()
            .Where(audit => audit.TargetInquiryId == inquiry.Id)
            .OrderBy(audit => audit.CreatedAt)
            .ToArrayAsync();

        Assert.False(restored.IsHiddenByModerator);
        Assert.Equal("Contenido preservado", restored.Content);
        Assert.Collection(
            audits,
            audit =>
            {
                Assert.Equal("HideInquiry", audit.Action);
                Assert.Equal(ServiceTestData.ModeratorUserId, audit.ActorUserId);
            },
            audit =>
            {
                Assert.Equal("RestoreInquiry", audit.Action);
                Assert.Equal(ServiceTestData.ModeratorUserId, audit.ActorUserId);
            });
    }
}
