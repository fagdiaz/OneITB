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
}
