using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using GraphQL.GraphQL;
using HotChocolate.Subscriptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.GraphQL.Messaging;
using Services.Academic;
using Services.Jobs;
using Services.Notifications;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Notifications;

public sealed class NotificationTargetResolutionTests
{
    private static IHttpContextAccessor CreateHttpContextAccessor(Guid userId, string role)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };

        var mock = new Mock<IHttpContextAccessor>();
        mock.Setup(x => x.HttpContext).Returns(httpContext);
        return mock.Object;
    }

    [Fact]
    public async Task AcademicTarget_ResolvesWhenCallerHasCareerAndEntitiesBelongToSubject()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var resource = new AcademicResource
        {
            Id = Guid.NewGuid(),
            SubjectId = ServiceTestData.SubjectId,
            UploaderId = ServiceTestData.TeacherUserId,
            Title = "Apunte 1",
            Category = AcademicResourceCategory.Apunte,
            ResourceType = "File"
        };
        context.AcademicResources.Add(resource);

        var progress = new AcademicProgress
        {
            Id = Guid.NewGuid(),
            SubjectId = ServiceTestData.SubjectId,
            UserId = ServiceTestData.StudentUserId,
            AssignedById = ServiceTestData.TeacherUserId,
            Status = AcademicProgressStatus.Approved,
            Score = 9.0m
        };
        context.AcademicProgressRecords.Add(progress);
        await context.SaveChangesAsync();

        var query = new Query();
        var http = CreateHttpContextAccessor(ServiceTestData.StudentUserId, "Estudiante");

        // Positive case: student queries academicTarget for their subject, resource, progress
        var target = await query.GetAcademicTarget(
            ServiceTestData.SubjectId,
            resource.Id,
            progress.Id,
            context,
            http,
            CancellationToken.None);

        Assert.NotNull(target);
        Assert.Equal(ServiceTestData.CareerId, target.CareerId);
        Assert.Equal(ServiceTestData.SubjectId, target.SubjectId);
        Assert.Equal(resource.Id, target.ResourceId);
        Assert.Equal(progress.Id, target.ProgressId);
    }

    [Fact]
    public async Task AcademicTarget_ReturnsNullWhenUserLacksCareerAccessOrResourceNotFound()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var query = new Query();
        // OtherStudentUserId belongs to OtherCareerId (Diseno Industrial), not Subject 101 (Analisis de Sistemas)
        var httpOtherCareer = CreateHttpContextAccessor(ServiceTestData.OtherStudentUserId, "Estudiante");

        var target = await query.GetAcademicTarget(
            ServiceTestData.SubjectId,
            null,
            null,
            context,
            httpOtherCareer,
            CancellationToken.None);

        Assert.Null(target);

        // Valid student, but non-existent resource ID
        var httpValidStudent = CreateHttpContextAccessor(ServiceTestData.StudentUserId, "Estudiante");
        var targetMissingResource = await query.GetAcademicTarget(
            ServiceTestData.SubjectId,
            Guid.NewGuid(),
            null,
            context,
            httpValidStudent,
            CancellationToken.None);

        Assert.Null(targetMissingResource);
    }

    [Fact]
    public async Task EmploymentApplication_OwnerAndEmployerCanResolve_ThirdPartyIsDeniedWithoutLeaking()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        Guid employerId = Guid.NewGuid();
        User employer = ServiceTestData.CreateUser(employerId, "Empresa", "S.A.", "Empleador", true);
        context.Users.Add(employer);

        var offer = new JobOffer
        {
            Id = Guid.NewGuid(),
            EmployerId = employerId,
            Title = "Dev .NET",
            Company = "Beltran Corp",
            Description = "Puesto backend",
            Location = "Remoto",
            IsActive = true
        };
        context.JobOffers.Add(offer);

        var app = new JobApplication
        {
            Id = Guid.NewGuid(),
            JobOfferId = offer.Id,
            ApplicantId = ServiceTestData.StudentUserId,
            Status = JobApplicationStatus.Pending,
            AppliedAt = DateTime.UtcNow
        };
        context.JobApplications.Add(app);
        await context.SaveChangesAsync();

        var query = new Query();

        // 1. Applicant can resolve
        var httpApplicant = CreateHttpContextAccessor(ServiceTestData.StudentUserId, "Estudiante");
        var appForApplicant = await query.GetEmploymentApplication(app.Id, context, httpApplicant, CancellationToken.None);
        Assert.NotNull(appForApplicant);
        Assert.Equal(app.Id, appForApplicant.Id);

        // 2. Employer can resolve
        var httpEmployer = CreateHttpContextAccessor(employerId, "Empleador");
        var appForEmployer = await query.GetEmploymentApplication(app.Id, context, httpEmployer, CancellationToken.None);
        Assert.NotNull(appForEmployer);
        Assert.Equal(app.Id, appForEmployer.Id);

        // 3. Unrelated third-party student cannot resolve (returns null, no leak)
        var httpThirdParty = CreateHttpContextAccessor(ServiceTestData.OtherStudentUserId, "Estudiante");
        var appForThirdParty = await query.GetEmploymentApplication(app.Id, context, httpThirdParty, CancellationToken.None);
        Assert.Null(appForThirdParty);
    }

    [Fact]
    public async Task MessagingPeer_ResolvesActiveUser_ReturnsNullForInactiveOrMissing()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var query = new Query();

        // Active user resolves
        var peer = await query.GetMessagingPeer(ServiceTestData.StudentUserId, context, CancellationToken.None);
        Assert.NotNull(peer);
        Assert.Equal(ServiceTestData.StudentUserId, peer.Id);
        Assert.Equal("Sofia", peer.FirstName);

        // Inactive user returns null
        var inactivePeer = await query.GetMessagingPeer(ServiceTestData.InactiveUserId, context, CancellationToken.None);
        Assert.Null(inactivePeer);

        // Missing user returns null
        var missingPeer = await query.GetMessagingPeer(Guid.NewGuid(), context, CancellationToken.None);
        Assert.Null(missingPeer);
    }

    [Fact]
    public async Task NotificationAggregation_NT_B_SeparatesInterlocutorsAndTracksCount()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var senderMock = new Mock<ITopicEventSender>();
        var loggerMock = new Mock<ILogger<NotificationService>>();
        var service = new NotificationService(context, senderMock.Object, loggerMock.Object);

        Guid peerA = ServiceTestData.TeacherUserId;
        Guid peerB = ServiceTestData.ModeratorUserId;

        // Reminder 1 from Peer A
        var notifA = await service.UpsertUnreadMessageReminderAsync(
            ServiceTestData.StudentUserId,
            1,
            DateTime.UtcNow,
            CancellationToken.None,
            peerA);

        Assert.NotNull(notifA);
        Assert.Contains(peerA.ToString("D"), notifA.GroupKey);
        Assert.Equal($"/chat?peerId={peerA:D}", notifA.ActionUrl);

        // Reminder 2 from Peer B
        var notifB = await service.UpsertUnreadMessageReminderAsync(
            ServiceTestData.StudentUserId,
            2,
            DateTime.UtcNow,
            CancellationToken.None,
            peerB);

        Assert.NotNull(notifB);
        Assert.Contains(peerB.ToString("D"), notifB.GroupKey);
        Assert.Equal($"/chat?peerId={peerB:D}", notifB.ActionUrl);

        // Both notifications coexist independently for the recipient
        var studentNotifications = await service.GetNotificationsAsync(ServiceTestData.StudentUserId, 10);
        Assert.Equal(2, studentNotifications.Count);

        // Marking read operates only for caller
        await service.MarkReadAsync(ServiceTestData.StudentUserId, notifA.Id);
        int unread = await service.GetUnreadCountAsync(ServiceTestData.StudentUserId);
        Assert.Equal(1, unread);

        // Third party cannot mark student's notification as read
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.MarkReadAsync(ServiceTestData.OtherStudentUserId, notifB.Id));
    }
}
