using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using Services.EmployerOnboarding;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.EmployerOnboarding;

public sealed class EmployerRequestServiceTests
{
    private static readonly Guid AdminId = Guid.NewGuid();

    [Fact]
    public async Task Submit_NormalizesDataAndPersistsPendingRequest()
    {
        await using var context = ServiceTestData.CreateContext();
        var service = new EmployerRequestService(context, TimeProvider.System);

        EmployerRequestSubmissionPayload payload = await service.SubmitAsync(new(
            "  Empresa   Técnica Sur  ",
            "  marina   LÓPEZ ",
            " CONTACTO@EMPRESA.COM.AR ",
            " +54 9 11 2233-4455 ",
            "30-12345678-1",
            "  Búsqueda de perfiles junior.  ",
            true,
            null));

        EmployerRequest request = Assert.Single(context.EmployerRequests);
        Assert.True(payload.Accepted);
        Assert.Equal("Empresa Técnica Sur", request.CompanyName);
        Assert.Equal("Marina López", request.ContactName);
        Assert.Equal("contacto@empresa.com.ar", request.Email);
        Assert.Equal("+5491122334455", request.Phone);
        Assert.Equal("30123456781", request.TaxId);
        Assert.Equal(EmployerRequestStatus.Pending, request.Status);
        Assert.Equal(EmployerEmailDeliveryStatus.NotRequested, request.EmailDeliveryStatus);
    }

    [Fact]
    public async Task Submit_HoneypotReturnsGenericSuccessWithoutPersistence()
    {
        await using var context = ServiceTestData.CreateContext();
        var service = new EmployerRequestService(context, TimeProvider.System);

        EmployerRequestSubmissionPayload payload = await service.SubmitAsync(new(
            "Bot Company",
            "Bot Contact",
            "bot@example.com",
            "+5491112345678",
            "30123456781",
            null,
            true,
            "https://spam.example"));

        Assert.True(payload.Accepted);
        Assert.Empty(context.EmployerRequests);
    }

    [Fact]
    public async Task Approve_CreatesMagicLinkOnlyEmployerAuditAndOutboxOnce()
    {
        await using var context = ServiceTestData.CreateContext();
        EmployerRequest request = CreatePendingRequest();
        context.EmployerRequests.Add(request);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var service = new EmployerRequestService(context, TimeProvider.System);

        EmployerRequestActionPayload first = await service.ApproveAsync(
            request.Id,
            AdminId,
            "test-correlation");
        EmployerRequestActionPayload second = await service.ApproveAsync(
            request.Id,
            AdminId,
            "test-correlation");

        Account account = await context.Accounts
            .Include(item => item.User)
            .SingleAsync(item => item.Email == request.Email);
        Assert.True(first.AccountCreated);
        Assert.False(second.AccountCreated);
        Assert.Null(account.PasswordHash);
        Assert.True(account.MagicLinkEnabled);
        Assert.Equal("Empleador", account.User.Role);
        Assert.Equal(EmployerEmailDeliveryStatus.Pending, first.EmailDeliveryStatus);
        Assert.Single(context.EmployerOnboardingOutboxMessages);
        Assert.Single(context.AuditLogs.Where(log => log.Action == "ApproveEmployerRequest"));
    }

    [Fact]
    public async Task Reject_RequiresReasonAndPersistsSanitizedAudit()
    {
        await using var context = ServiceTestData.CreateContext();
        EmployerRequest request = CreatePendingRequest();
        context.EmployerRequests.Add(request);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var service = new EmployerRequestService(context, TimeProvider.System);

        EmployerRequestException missingReason = await Assert.ThrowsAsync<EmployerRequestException>(
            () => service.RejectAsync(request.Id, " ", AdminId, null));
        Assert.Equal("EMPLOYER_REQUEST_REASON_REQUIRED", missingReason.Code);

        EmployerRequestActionPayload payload = await service.RejectAsync(
            request.Id,
            "No se pudo validar el CUIT.",
            AdminId,
            "corr");

        Assert.Equal(EmployerRequestStatus.Rejected, payload.Request.Status);
        AuditLog audit = Assert.Single(context.AuditLogs);
        Assert.DoesNotContain(request.Email, audit.NewValuesJson ?? string.Empty);
        Assert.DoesNotContain(request.TaxId, audit.NewValuesJson ?? string.Empty);
        Assert.DoesNotContain("No se pudo validar", audit.NewValuesJson ?? string.Empty);
    }

    [Fact]
    public void EfModel_UsesFilteredUniqueIndexesRowVersionsAndRestrictFks()
    {
        using var context = ServiceTestData.CreateContext();
        IEntityType requestType = context.Model.FindEntityType(typeof(EmployerRequest))!;
        IEntityType outboxType = context.Model.FindEntityType(
            typeof(EmployerOnboardingOutboxMessage))!;

        IIndex emailIndex = Assert.Single(
            requestType.GetIndexes(),
            index =>
                index.Properties.Select(property => property.Name)
                    .SequenceEqual(new[] { nameof(EmployerRequest.Email) }));
        IIndex taxIdIndex = Assert.Single(
            requestType.GetIndexes(),
            index =>
                index.Properties.Select(property => property.Name)
                    .SequenceEqual(new[] { nameof(EmployerRequest.TaxId) }));

        Assert.True(emailIndex.IsUnique);
        Assert.Contains("Pending", emailIndex.GetFilter());
        Assert.True(taxIdIndex.IsUnique);
        Assert.True(requestType.FindProperty(nameof(EmployerRequest.RowVersion))!.IsConcurrencyToken);
        Assert.True(outboxType.FindProperty(nameof(EmployerOnboardingOutboxMessage.RowVersion))!.IsConcurrencyToken);
        Assert.All(
            requestType.GetForeignKeys().Concat(outboxType.GetForeignKeys()),
            foreignKey => Assert.Equal(DeleteBehavior.Restrict, foreignKey.DeleteBehavior));
    }

    private static EmployerRequest CreatePendingRequest()
    {
        return new EmployerRequest
        {
            Id = Guid.NewGuid(),
            CompanyName = "Empresa de Prueba",
            ContactName = "Julia Empresa",
            Email = $"empresa.{Guid.NewGuid():N}@example.com",
            Phone = "+5491112345678",
            TaxId = "30123456781",
            Status = EmployerRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            PrivacyConsentAt = DateTime.UtcNow
        };
    }
}
