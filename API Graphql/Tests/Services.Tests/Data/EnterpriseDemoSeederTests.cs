using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Data;

public sealed class EnterpriseDemoSeederTests
{
    private const string DemoPassword = "Acceptance123!";
    private const string ChangedPassword = "Changed123!";

    [Fact]
    public async Task SeedAsync_CreatesOneModeratorAndPreservesExistingPassword()
    {
        await using var context = ServiceTestData.CreateContext();

        await EnterpriseDemoSeeder.SeedAsync(
            context,
            DemoPassword,
            password => BCrypt.Net.BCrypt.HashPassword(password, workFactor: 4));

        Account firstAccount = await context.Accounts
            .Include(account => account.User)
            .SingleAsync(account => account.Id == EnterpriseDemoSeeder.Moderator1Id);
        Assert.Equal("moderador1@itbeltran.com.ar", firstAccount.Email);
        Assert.Equal("Moderador", firstAccount.User.Role);
        Assert.True(firstAccount.User.IsActive);
        Assert.True(BCrypt.Net.BCrypt.Verify(DemoPassword, firstAccount.PasswordHash));

        string changedHash = BCrypt.Net.BCrypt.HashPassword(ChangedPassword, workFactor: 4);
        firstAccount.PasswordHash = changedHash;
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        await EnterpriseDemoSeeder.SeedAsync(
            context,
            DemoPassword,
            password => BCrypt.Net.BCrypt.HashPassword(password, workFactor: 4));

        Account persistedAccount = await context.Accounts
            .AsNoTracking()
            .Include(account => account.User)
            .SingleAsync(account => account.Id == EnterpriseDemoSeeder.Moderator1Id);
        Assert.Equal(changedHash, persistedAccount.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(ChangedPassword, persistedAccount.PasswordHash));
        Assert.Equal(
            1,
            await context.Accounts.CountAsync(
                account => account.Email == "moderador1@itbeltran.com.ar"));
        Assert.Equal(
            1,
            await context.Users.CountAsync(
                user => user.Id == EnterpriseDemoSeeder.Moderator1Id &&
                        user.Role == "Moderador"));
        Assert.Equal(280, await context.Messages.CountAsync());
        Assert.False(await context.Messages.AnyAsync(
            message =>
                message.SenderId == EnterpriseDemoSeeder.Moderator1Id ||
                message.ReceiverId == EnterpriseDemoSeeder.Moderator1Id));
        Assert.False(await context.Notifications.AnyAsync(
            notification =>
                notification.UserId == EnterpriseDemoSeeder.Moderator1Id &&
                notification.Type == NotificationType.JobOffer));
    }

    [Fact]
    public async Task SeedAsync_CreatesCompleteCanonicalGraphAndIsIdempotent()
    {
        await using var context = ServiceTestData.CreateContext();

        await EnterpriseDemoSeeder.SeedAsync(
            context,
            DemoPassword,
            password => BCrypt.Net.BCrypt.HashPassword(password, workFactor: 4));
        SeedInventory first = await CaptureInventoryAsync(context);

        await EnterpriseDemoSeeder.SeedAsync(
            context,
            DemoPassword,
            password => BCrypt.Net.BCrypt.HashPassword(password, workFactor: 4));
        SeedInventory second = await CaptureInventoryAsync(context);

        Assert.Equal(first, second);
        Assert.Equal(15, second.Accounts);
        Assert.Equal(15, second.Users);
        Assert.Equal(9, second.Careers);
        Assert.Equal(6, second.Subjects);
        Assert.Equal(4, second.SubjectPrerequisites);
        Assert.Equal(10, second.UserCareers);
        Assert.Equal(12, second.AcademicResources);
        Assert.Equal(18, second.AcademicProgress);
        Assert.Equal(60, second.Inquiries);
        Assert.Equal(80, second.Comments);
        Assert.Equal(240, second.Reactions);
        Assert.Equal(2, second.CommunityReports);
        Assert.Equal(10, second.UserInteractions);
        Assert.Equal(280, second.Messages);
        Assert.Equal(120, second.NotificationPreferences);
        Assert.Equal(4, second.JobOffers);
        Assert.Equal(6, second.JobApplications);
        Assert.Equal(3, second.EmployerRequests);
        Assert.Equal(1, second.EmployerOnboardingOutboxMessages);
        Assert.Equal(12, second.CvExperiences);
        Assert.Equal(12, second.CvEducations);
        Assert.Equal(12, second.CvProjects);
        Assert.Equal(12, second.CvSkills);
        Assert.Equal(12, second.CvLanguages);

        List<Comment> comments = await context.Comments
            .IgnoreQueryFilters()
            .AsNoTracking()
            .ToListAsync();
        Dictionary<Guid, Comment> commentsById = comments.ToDictionary(comment => comment.Id);
        Assert.DoesNotContain(
            comments,
            comment =>
                comment.ParentCommentId.HasValue &&
                commentsById[comment.ParentCommentId.Value].ParentCommentId.HasValue);
        Assert.DoesNotContain(
            await context.UserInteractions.AsNoTracking().ToListAsync(),
            interaction => interaction.ObserverId == interaction.TargetId);
    }

    private static async Task<SeedInventory> CaptureInventoryAsync(OneItbContext context)
    {
        return new SeedInventory(
            await context.Accounts.CountAsync(),
            await context.Users.CountAsync(),
            await context.Careers.CountAsync(),
            await context.Subjects.IgnoreQueryFilters().CountAsync(),
            await context.SubjectPrerequisites.CountAsync(),
            await context.UserCareers.CountAsync(),
            await context.AcademicResources.IgnoreQueryFilters().CountAsync(),
            await context.AcademicProgressRecords.CountAsync(),
            await context.Inquiries.IgnoreQueryFilters().CountAsync(),
            await context.Comments.IgnoreQueryFilters().CountAsync(),
            await context.Reactions.IgnoreQueryFilters().CountAsync(),
            await context.CommunityReports.IgnoreQueryFilters().CountAsync(),
            await context.UserInteractions.CountAsync(),
            await context.Messages.CountAsync(),
            await context.NotificationPreferences.CountAsync(),
            await context.Notifications.CountAsync(),
            await context.JobOffers.CountAsync(),
            await context.JobApplications.CountAsync(),
            await context.EmployerRequests.CountAsync(),
            await context.EmployerOnboardingOutboxMessages.CountAsync(),
            await context.UserCvExperiences.CountAsync(),
            await context.UserCvEducations.CountAsync(),
            await context.UserCvProjects.CountAsync(),
            await context.UserCvSkills.CountAsync(),
            await context.UserCvLanguages.CountAsync());
    }

    private sealed record SeedInventory(
        int Accounts,
        int Users,
        int Careers,
        int Subjects,
        int SubjectPrerequisites,
        int UserCareers,
        int AcademicResources,
        int AcademicProgress,
        int Inquiries,
        int Comments,
        int Reactions,
        int CommunityReports,
        int UserInteractions,
        int Messages,
        int NotificationPreferences,
        int Notifications,
        int JobOffers,
        int JobApplications,
        int EmployerRequests,
        int EmployerOnboardingOutboxMessages,
        int CvExperiences,
        int CvEducations,
        int CvProjects,
        int CvSkills,
        int CvLanguages);
}
