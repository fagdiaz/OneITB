using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HotChocolate;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using OneItb.Entities.Models;
using OneItb.GraphQL.Services.Email;
using OneITB.Core.Services.Interfaces;
using Services.Auth;
using Services.Tests.TestSupport;
using Xunit;
using IOPath = System.IO.Path;

namespace Services.Tests.Auth;

public sealed class EmployerAuthServiceTests
{
    [Fact]
    public async Task LoginWithMagicLink_IssuesJwtAndConsumesLinkOnce()
    {
        await using var context = ServiceTestData.CreateContext();
        (MagicLink link, string credential) = await SeedEmployerMagicLinkAsync(context);
        var service = CreateService(context);

        string token = await service.LoginWithMagicLinkAsync(credential);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.Equal(3, token.Split('.').Length);
        Assert.Contains(jwt.Claims, claim =>
            claim.Type == ClaimTypes.Role && claim.Value == "Empleador");
        Assert.Contains(jwt.Claims, claim =>
            claim.Type == JwtRegisteredClaimNames.Sub &&
            claim.Value == link.AccountId.ToString());
        Assert.True(await context.MagicLinks
            .AsNoTracking()
            .Where(item => item.Id == link.Id)
            .Select(item => item.IsUsed)
            .SingleAsync());

        GraphQLException replay = await Assert.ThrowsAsync<GraphQLException>(
            () => service.LoginWithMagicLinkAsync(credential));
        Assert.Equal("AUTH_MAGIC_LINK_INVALID", replay.Errors[0].Code);
    }

    [Fact]
    public async Task LoginWithMagicLink_RejectsExpiredLink()
    {
        await using var context = ServiceTestData.CreateContext();
        (MagicLink link, string credential) = await SeedEmployerMagicLinkAsync(
            context,
            expiresAt: DateTime.UtcNow.AddMinutes(-1));
        var service = CreateService(context);

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(
            () => service.LoginWithMagicLinkAsync(credential));

        Assert.Equal("AUTH_MAGIC_LINK_INVALID", exception.Errors[0].Code);
    }

    [Fact]
    public async Task LoginWithMagicLink_RejectsInactiveEmployer()
    {
        await using var context = ServiceTestData.CreateContext();
        (MagicLink link, string credential) = await SeedEmployerMagicLinkAsync(
            context,
            isActive: false);
        var service = CreateService(context);

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(
            () => service.LoginWithMagicLinkAsync(credential));

        Assert.Equal("AUTH_MAGIC_LINK_INVALID", exception.Errors[0].Code);
        Assert.False(await context.MagicLinks
            .Where(item => item.Id == link.Id)
            .Select(item => item.IsUsed)
            .SingleAsync());
    }

    [Fact]
    public async Task RequestMagicLink_DeliversCredentialAndPersistsOnlyItsDigest()
    {
        await using var context = ServiceTestData.CreateContext();
        var sender = new CapturingEmailSender();
        var passwordHasher = CreatePasswordHasher();
        var service = CreateService(context, sender, passwordHasher);

        MagicLinkRequestPayload payload = await service.RequestMagicLinkAsync(
            " employer.demo@itbeltran.com.ar ",
            "30712345678");

        User user = await context.Users
            .Include(item => item.Account)
            .SingleAsync(item => item.Account.Email == "employer.demo@itbeltran.com.ar");
        Assert.Equal("Empleador", user.Role);
        Assert.Equal(60, user.Account.PasswordHash.Length);
        Assert.True(passwordHasher.Verify("not-the-placeholder-password", user.Account.PasswordHash) is false);
        Assert.Single(sender.Messages);

        string credential = ExtractFragmentCredential(sender.Messages[0].Body);
        string persistedDigest = await context.MagicLinks
            .Where(item => item.AccountId == user.Account.Id)
            .Select(item => item.Token)
            .SingleAsync();

        Assert.True(payload.Accepted);
        Assert.DoesNotContain(credential, payload.Message, StringComparison.Ordinal);
        Assert.Equal(64, persistedDigest.Length);
        Assert.Equal(ComputeDigest(credential), persistedDigest);
        Assert.NotEqual(credential, persistedDigest);
    }

    [Fact]
    public async Task RequestMagicLink_DoesNotRevealExistingNonEmployer()
    {
        await using var context = ServiceTestData.CreateContext();
        User student = ServiceTestData.CreateUser(
            Guid.NewGuid(),
            "Estela",
            "Estudiante",
            "Estudiante",
            isActive: true);
        Account account = ServiceTestData.CreateAccount(
            student,
            "student.magic-link@itbeltran.com.ar");
        context.Accounts.Add(account);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var sender = new CapturingEmailSender();
        var service = CreateService(context, sender);
        MagicLinkRequestPayload payload = await service.RequestMagicLinkAsync(
            account.Email,
            "30712345678");

        Assert.True(payload.Accepted);
        Assert.Empty(sender.Messages);
        Assert.Empty(context.MagicLinks);
    }

    [Fact]
    public async Task RequestMagicLink_RemovesPersistedLinkWhenDeliveryFails()
    {
        await using var context = ServiceTestData.CreateContext();
        var service = CreateService(context, new ThrowingEmailSender());

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(
            () => service.RequestMagicLinkAsync(
                "delivery.failure@itbeltran.com.ar",
                "30712345678"));

        Assert.Equal(
            "AUTH_MAGIC_LINK_DELIVERY_UNAVAILABLE",
            exception.Errors[0].Code);
        Assert.Empty(await context.MagicLinks.AsNoTracking().ToListAsync());
    }

    [Fact]
    public async Task DevelopmentPickup_RequestAndRedemptionCompleteEndToEnd()
    {
        string root = IOPath.Combine(
            IOPath.GetTempPath(),
            $"oneitb-magiclink-e2e-{Guid.NewGuid():N}");
        string pickupDirectory = IOPath.Combine(root, "App_Data", "MailDrop");
        Directory.CreateDirectory(root);
        try
        {
            await using var context = ServiceTestData.CreateContext();
            var sender = new PickupDirectoryEmailService(
                pickupDirectory,
                NullLogger<PickupDirectoryEmailService>.Instance);
            var service = CreateService(context, sender);

            MagicLinkRequestPayload payload = await service.RequestMagicLinkAsync(
                "pickup.employer@itbeltran.com.ar",
                "30712345678");

            Assert.True(payload.Accepted);
            string mailFile = Assert.Single(
                Directory.GetFiles(pickupDirectory, "*.eml"));
            string credential = ExtractFragmentCredential(
                await File.ReadAllTextAsync(mailFile));

            string jwt = await service.LoginWithMagicLinkAsync(credential);
            Assert.Equal(3, jwt.Split('.').Length);
            GraphQLException replay = await Assert.ThrowsAsync<GraphQLException>(
                () => service.LoginWithMagicLinkAsync(credential));
            Assert.Equal("AUTH_MAGIC_LINK_INVALID", replay.Errors[0].Code);
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }

    private static EmployerAuthService CreateService(
        DbContext context,
        IEmailSender? emailSender = null,
        IPasswordHasher? passwordHasher = null)
    {
        var options = new JwtTokenOptions(
            "oneitb23-test-signing-key-with-at-least-32-bytes",
            "OneITB23.Tests",
            "OneITB23.Tests",
            TimeSpan.FromHours(2));
        return new EmployerAuthService(
            (OneItb.Data.OneItbContext)context,
            new JwtTokenService(options, TimeProvider.System),
            passwordHasher ?? CreatePasswordHasher(),
            emailSender ?? new CapturingEmailSender(),
            new MagicLinkDeliveryOptions("https://frontend.oneitb.test"),
            TimeProvider.System);
    }

    private static async Task<(MagicLink Link, string Credential)> SeedEmployerMagicLinkAsync(
        OneItb.Data.OneItbContext context,
        DateTime? expiresAt = null,
        bool isActive = true)
    {
        Guid userId = Guid.NewGuid();
        User employer = ServiceTestData.CreateUser(
            userId,
            "Elena",
            "Empleadora",
            "Empleador",
            isActive);
        Account account = ServiceTestData.CreateAccount(
            employer,
            $"employer.{userId:N}@itbeltran.test");
        string credential = Convert.ToHexString(RandomNumberGenerator.GetBytes(32))
            .ToLowerInvariant();
        var link = new MagicLink
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Account = account,
            Token = ComputeDigest(credential),
            ExpiresAt = expiresAt ?? DateTime.UtcNow.AddMinutes(10),
            CreatedAt = DateTime.UtcNow,
            IsUsed = false
        };

        context.Accounts.Add(account);
        context.MagicLinks.Add(link);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        return (link, credential);
    }

    private static IPasswordHasher CreatePasswordHasher()
    {
        return new BcryptPasswordHasher(new PasswordHashingOptions(10));
    }

    private static string ExtractFragmentCredential(string body)
    {
        const string marker = "#token=";
        int start = body.IndexOf(marker, StringComparison.Ordinal);
        Assert.True(start >= 0);
        string credential = body[(start + marker.Length)..]
            .Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries)[0]
            .Trim();
        Assert.Matches("^[a-f0-9]{64}$", credential);
        return credential;
    }

    private static string ComputeDigest(string credential)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(credential)))
            .ToLowerInvariant();
    }

    private sealed class CapturingEmailSender : IEmailSender
    {
        public List<EmailMessage> Messages { get; } = new();

        public Task SendAsync(
            string recipient,
            string subject,
            string body,
            CancellationToken cancellationToken = default)
        {
            Messages.Add(new EmailMessage(recipient, subject, body));
            return Task.CompletedTask;
        }
    }

    private sealed record EmailMessage(string Recipient, string Subject, string Body);

    private sealed class ThrowingEmailSender : IEmailSender
    {
        public Task SendAsync(
            string recipient,
            string subject,
            string body,
            CancellationToken cancellationToken = default)
        {
            throw new InvalidOperationException("Simulated provider outage.");
        }
    }
}
