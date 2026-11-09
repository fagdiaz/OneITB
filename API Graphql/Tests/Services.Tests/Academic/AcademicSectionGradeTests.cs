using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Academic;
using Services.Notifications;
using Services.Siu;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Academic;

public sealed class AcademicSectionGradeTests
{
    private static Mock<INotificationService> CreateNotificationMock()
    {
        var mock = new Mock<INotificationService>(MockBehavior.Loose);
        mock.Setup(service => service.CreateNotificationsAsync(
                It.IsAny<IReadOnlyCollection<Guid>>(),
                It.IsAny<NotificationType>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Notification>());
        return mock;
    }

    [Fact]
    public async Task SaveSectionGradeAsync_AC_A_AssignedProfessorCannotGradeAnotherSection()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        // Section A (K3051) and Section B (K3052) for Subject 101
        var sectionA = new CourseSection
        {
            Id = Guid.NewGuid(),
            SubjectId = ServiceTestData.SubjectId,
            Term = "2026-1C",
            Code = "K3051"
        };
        var sectionB = new CourseSection
        {
            Id = Guid.NewGuid(),
            SubjectId = ServiceTestData.SubjectId,
            Term = "2026-1C",
            Code = "K3052"
        };
        context.CourseSections.AddRange(sectionA, sectionB);

        // Professor is assigned ONLY to Section A
        context.SectionInstructors.Add(new SectionInstructor
        {
            SectionId = sectionA.Id,
            ProfessorId = ServiceTestData.TeacherUserId
        });

        // Student is enrolled in Section B
        context.SectionEnrollments.Add(new SectionEnrollment
        {
            SectionId = sectionB.Id,
            StudentId = ServiceTestData.StudentUserId
        });
        await context.SaveChangesAsync();

        // Attempt: Professor assigned to Section A tries to grade Section B of same subject
        var input = new SectionGradeInput(
            sectionB.Id,
            ServiceTestData.StudentUserId,
            8.5m,
            AcademicProgressStatus.Approved,
            null);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SaveSectionGradeAsync(ServiceTestData.TeacherUserId, "Profesor", input));

        Assert.Contains("docente no está asignado", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SaveSectionGradeAsync_AC_A_ReenrollingStudentAcrossTermsPreservesBothHistoricalGrades()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        var section1C = new CourseSection
        {
            Id = Guid.NewGuid(),
            SubjectId = ServiceTestData.SubjectId,
            Term = "2026-1C",
            Code = "K3051"
        };
        var section2C = new CourseSection
        {
            Id = Guid.NewGuid(),
            SubjectId = ServiceTestData.SubjectId,
            Term = "2026-2C",
            Code = "K3052"
        };
        context.CourseSections.AddRange(section1C, section2C);

        // Assign teacher to both sections
        context.SectionInstructors.AddRange(
            new SectionInstructor { SectionId = section1C.Id, ProfessorId = ServiceTestData.TeacherUserId },
            new SectionInstructor { SectionId = section2C.Id, ProfessorId = ServiceTestData.TeacherUserId });

        // Enroll student in both sections (different terms)
        context.SectionEnrollments.AddRange(
            new SectionEnrollment { SectionId = section1C.Id, StudentId = ServiceTestData.StudentUserId },
            new SectionEnrollment { SectionId = section2C.Id, StudentId = ServiceTestData.StudentUserId });
        await context.SaveChangesAsync();

        // Grade 1: 2026-1C -> Regular (6)
        var input1C = new SectionGradeInput(
            section1C.Id,
            ServiceTestData.StudentUserId,
            6.0m,
            AcademicProgressStatus.Regular,
            null);
        await service.SaveSectionGradeAsync(ServiceTestData.TeacherUserId, "Profesor", input1C);

        // Grade 2: 2026-2C -> Approved (8)
        var input2C = new SectionGradeInput(
            section2C.Id,
            ServiceTestData.StudentUserId,
            8.0m,
            AcademicProgressStatus.Approved,
            null);
        await service.SaveSectionGradeAsync(ServiceTestData.TeacherUserId, "Profesor", input2C);

        // Assert: Both section grades are preserved independently
        var grade1C = await context.SectionGrades.FirstOrDefaultAsync(g => g.SectionId == section1C.Id && g.StudentId == ServiceTestData.StudentUserId);
        var grade2C = await context.SectionGrades.FirstOrDefaultAsync(g => g.SectionId == section2C.Id && g.StudentId == ServiceTestData.StudentUserId);

        Assert.NotNull(grade1C);
        Assert.Equal(6.0m, grade1C.Score);
        Assert.Equal(AcademicProgressStatus.Regular, grade1C.Status);

        Assert.NotNull(grade2C);
        Assert.Equal(8.0m, grade2C.Score);
        Assert.Equal(AcademicProgressStatus.Approved, grade2C.Status);

        // Assert: AcademicProgress holds projected final summary from latest update
        var progress = await context.AcademicProgressRecords.FirstOrDefaultAsync(p => p.UserId == ServiceTestData.StudentUserId && p.SubjectId == ServiceTestData.SubjectId);
        Assert.NotNull(progress);
        Assert.Equal(8.0m, progress.Score);
        Assert.Equal(AcademicProgressStatus.Approved, progress.Status);
    }

    [Fact]
    public async Task SaveSectionGradeAsync_AC_A_StaleVersionThrowsConcurrencyConflict()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        var section = new CourseSection
        {
            Id = Guid.NewGuid(),
            SubjectId = ServiceTestData.SubjectId,
            Term = "2026-1C",
            Code = "K3051"
        };
        context.CourseSections.Add(section);
        context.SectionInstructors.Add(new SectionInstructor { SectionId = section.Id, ProfessorId = ServiceTestData.TeacherUserId });
        context.SectionEnrollments.Add(new SectionEnrollment { SectionId = section.Id, StudentId = ServiceTestData.StudentUserId });
        await context.SaveChangesAsync();

        // Initial save
        var initialInput = new SectionGradeInput(section.Id, ServiceTestData.StudentUserId, 7.0m, AcademicProgressStatus.InProgress, null);
        var savedGrade = await service.SaveSectionGradeAsync(ServiceTestData.TeacherUserId, "Profesor", initialInput);
        string capturedVersion = Convert.ToBase64String(savedGrade.RowVersion);

        // Concurrent update by another writer
        var concurrentInput = new SectionGradeInput(section.Id, ServiceTestData.StudentUserId, 9.0m, AcademicProgressStatus.Approved, capturedVersion);
        await service.SaveSectionGradeAsync(ServiceTestData.TeacherUserId, "Profesor", concurrentInput);

        // Attempt: original writer submits with now-stale capturedVersion
        var staleInput = new SectionGradeInput(section.Id, ServiceTestData.StudentUserId, 6.0m, AcademicProgressStatus.InProgress, capturedVersion);
        var conflictEx = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SaveSectionGradeAsync(ServiceTestData.TeacherUserId, "Profesor", staleInput));

        Assert.Contains("concurrencia", conflictEx.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetSectionRosterPageAsync_RejectsUnauthorizedCaller()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        var section = new CourseSection
        {
            Id = Guid.NewGuid(),
            SubjectId = ServiceTestData.SubjectId,
            Term = "2026-1C",
            Code = "K3051"
        };
        context.CourseSections.Add(section);
        await context.SaveChangesAsync();

        // Student tries to view roster
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.GetSectionRosterPageAsync(ServiceTestData.StudentUserId, "Estudiante", section.Id, 10, null));
    }

    [Fact]
    public async Task IssueRegularStudentCertificateAsync_AC_B_SelfDeclarationWithoutStandingIsRejected()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        // Student has UserCareer (self-declared enrollment), but NO EnrollmentStanding record
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.IssueRegularStudentCertificateAsync(ServiceTestData.StudentUserId, ServiceTestData.CareerId));

        Assert.Contains("acreditación institucional regular vigente", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task IssueRegularStudentCertificateAsync_AC_B_ExpiredOrRevokedStandingIsRejected()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        // Expired standing
        var expiredStanding = new EnrollmentStanding
        {
            Id = Guid.NewGuid(),
            StudentId = ServiceTestData.StudentUserId,
            CareerId = ServiceTestData.CareerId,
            Term = "2025-2C",
            Source = "SIU",
            SourceReference = "EXP-001",
            Status = "Regular",
            ValidFromUtc = DateTime.UtcNow.AddMonths(-12),
            ValidUntilUtc = DateTime.UtcNow.AddMonths(-1),
            RevokedAtUtc = null
        };
        context.EnrollmentStandings.Add(expiredStanding);
        await context.SaveChangesAsync();

        var exExpired = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.IssueRegularStudentCertificateAsync(ServiceTestData.StudentUserId, ServiceTestData.CareerId));
        Assert.Contains("acreditación institucional regular vigente", exExpired.Message, StringComparison.OrdinalIgnoreCase);

        // Revoked standing
        expiredStanding.ValidUntilUtc = DateTime.UtcNow.AddMonths(3);
        expiredStanding.RevokedAtUtc = DateTime.UtcNow.AddDays(-1);
        await context.SaveChangesAsync();

        var exRevoked = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.IssueRegularStudentCertificateAsync(ServiceTestData.StudentUserId, ServiceTestData.CareerId));
        Assert.Contains("acreditación institucional regular vigente", exRevoked.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task IssueRegularStudentCertificateAsync_AC_B_ValidStandingIssuesAndReusesCertificate()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);

        var notifications = CreateNotificationMock();
        var siu = new Mock<ISiuIntegrationService>(MockBehavior.Strict);
        var service = new AcademicService(context, notifications.Object, siu.Object);

        DateTime validUntil = DateTime.UtcNow.AddMonths(6);
        var standing = new EnrollmentStanding
        {
            Id = Guid.NewGuid(),
            StudentId = ServiceTestData.StudentUserId,
            CareerId = ServiceTestData.CareerId,
            Term = "2026-1C",
            Source = "SIU-Guarani",
            SourceReference = "SIU-REG-2026-99",
            Status = "Regular",
            ValidFromUtc = DateTime.UtcNow.AddMonths(-1),
            ValidUntilUtc = validUntil,
            RevokedAtUtc = null
        };
        context.EnrollmentStandings.Add(standing);
        await context.SaveChangesAsync();

        // Issue certificate
        var cert = await service.IssueRegularStudentCertificateAsync(ServiceTestData.StudentUserId, ServiceTestData.CareerId);

        Assert.NotNull(cert);
        Assert.Equal(standing.Id, cert.StandingId);
        Assert.Equal(standing.Term, cert.Term);
        Assert.Equal("Sofia Alumno", cert.FullName);
        Assert.Equal("Analisis de Sistemas", cert.CareerName);
        Assert.Equal(validUntil, cert.ValidUntil);

        // Idempotency: Reissuing reuses existing valid certificate without duplication
        var secondCert = await service.IssueRegularStudentCertificateAsync(ServiceTestData.StudentUserId, ServiceTestData.CareerId);
        Assert.Equal(cert.Id, secondCert.Id);

        int totalCertificates = await context.RegularStudentCertificates.CountAsync(c => c.StandingId == standing.Id);
        Assert.Equal(1, totalCertificates);

        // Query certificate as student
        var studentCert = await service.GetMyRegularStudentCertificateAsync(ServiceTestData.StudentUserId, ServiceTestData.CareerId);
        Assert.NotNull(studentCert);
        Assert.Equal(cert.Id, studentCert.Id);

        // Third-party student cannot read it
        var otherCert = await service.GetMyRegularStudentCertificateAsync(ServiceTestData.OtherStudentUserId, ServiceTestData.CareerId);
        Assert.Null(otherCert);
    }
}
