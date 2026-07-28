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
}
