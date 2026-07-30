using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using OneItb.Entities.Models;
using OneItb.GraphQL.Infrastructure;
using OneITB.Core.Services.Interfaces;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.EmployerOnboarding;

public sealed class EmployerOnboardingDeliveryProcessorTests
{
    [Fact]
    public async Task ProcessNext_MarksRequestAndOutboxDelivered()
    {
        await using var context = ServiceTestData.CreateContext();
        EmployerRequest request = await SeedApprovedRequestAsync(context);
        var auth = new StubEmployerAuthService();
        var processor = CreateProcessor(context, auth, maxAttempts: 3);

        bool processed = await processor.ProcessNextAsync();

        Assert.True(processed);
        Assert.Equal(request.Id, Assert.Single(auth.WelcomeRequestIds));
        EmployerOnboardingOutboxMessage outbox = await context
            .EmployerOnboardingOutboxMessages
            .AsNoTracking()
            .SingleAsync();
        EmployerRequest persisted = await context.EmployerRequests
            .AsNoTracking()
            .SingleAsync();
        Assert.Equal(EmployerOutboxStatus.Delivered, outbox.Status);
        Assert.Equal(EmployerEmailDeliveryStatus.Delivered, persisted.EmailDeliveryStatus);
        Assert.Equal(1, persisted.EmailDeliveryAttempts);
    }

    [Fact]
    public async Task ProcessNext_RecordsBoundedFailureWithoutSensitivePayload()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedApprovedRequestAsync(context);
        var auth = new StubEmployerAuthService { Failure = new InvalidOperationException("provider secret detail") };
        var processor = CreateProcessor(context, auth, maxAttempts: 1);

        Assert.True(await processor.ProcessNextAsync());

        EmployerOnboardingOutboxMessage outbox = await context
            .EmployerOnboardingOutboxMessages
            .AsNoTracking()
            .SingleAsync();
        Assert.Equal(EmployerOutboxStatus.Failed, outbox.Status);
        Assert.Equal(nameof(InvalidOperationException), outbox.LastErrorCode);
        Assert.DoesNotContain("secret", outbox.LastErrorCode ?? string.Empty);
        Assert.Equal(
            EmployerEmailDeliveryStatus.Failed,
            await context.EmployerRequests
                .Select(request => request.EmailDeliveryStatus)
                .SingleAsync());
    }

    private static EmployerOnboardingDeliveryProcessor CreateProcessor(
        OneItb.Data.OneItbContext context,
        IEmployerAuthService auth,
        int maxAttempts)
    {
        return new EmployerOnboardingDeliveryProcessor(
            context,
            auth,
            new EmployerOnboardingOptions(
                true,
                TimeSpan.Zero,
                TimeSpan.FromSeconds(10),
                TimeSpan.FromMinutes(2),
                maxAttempts,
                TimeSpan.FromSeconds(5)),
            TimeProvider.System,
            NullLogger<EmployerOnboardingDeliveryProcessor>.Instance);
    }

    private static async Task<EmployerRequest> SeedApprovedRequestAsync(
        OneItb.Data.OneItbContext context)
    {
        Guid requestId = Guid.NewGuid();
        var request = new EmployerRequest
        {
            Id = requestId,
            CompanyName = "Empresa Aprobada",
            ContactName = "Elena Empresa",
            Email = $"approved.{requestId:N}@example.com",
            Phone = "+5491112345678",
            TaxId = "30123456781",
            Status = EmployerRequestStatus.Approved,
            CreatedAt = DateTime.UtcNow.AddMinutes(-5),
            ProcessedAt = DateTime.UtcNow.AddMinutes(-4),
            ProvisionedUserId = Guid.NewGuid(),
            PrivacyConsentAt = DateTime.UtcNow.AddMinutes(-5),
            EmailDeliveryStatus = EmployerEmailDeliveryStatus.Pending
        };
        context.EmployerRequests.Add(request);
        context.EmployerOnboardingOutboxMessages.Add(new EmployerOnboardingOutboxMessage
        {
            Id = Guid.NewGuid(),
            EmployerRequestId = requestId,
            Status = EmployerOutboxStatus.Pending,
            CreatedAt = DateTime.UtcNow.AddMinutes(-4),
            NextAttemptAt = DateTime.UtcNow.AddMinutes(-1)
        });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        return request;
    }

    private sealed class StubEmployerAuthService : IEmployerAuthService
    {
        public Exception? Failure { get; set; }
        public List<Guid> WelcomeRequestIds { get; } = new();

        public Task<MagicLinkRequestPayload> RequestMagicLinkAsync(
            string email,
            string cuit,
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<string> LoginWithMagicLinkAsync(
            string token,
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task SendWelcomeMagicLinkAsync(
            Guid employerRequestId,
            CancellationToken cancellationToken = default)
        {
            if (Failure is not null)
                throw Failure;
            WelcomeRequestIds.Add(employerRequestId);
            return Task.CompletedTask;
        }
    }
}
