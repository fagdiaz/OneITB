using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;
using Services.Academic;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Academic;

public sealed class StudentEnrollmentServiceTests
{
    [Fact]
    public async Task ConfirmStudentCareerAsync_ReconcilesMultipleLinksToOneCareer()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        context.UserCareers.Add(new UserCareer
        {
            UserId = ServiceTestData.StudentUserId,
            CareerId = ServiceTestData.OtherCareerId
        });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var service = new StudentEnrollmentService(context);

        Career result = await service.ConfirmStudentCareerAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.OtherCareerId);

        Assert.Equal(ServiceTestData.OtherCareerId, result.Id);
        int[] persistedIds = await context.UserCareers
            .Where(link => link.UserId == ServiceTestData.StudentUserId)
            .Select(link => link.CareerId)
            .ToArrayAsync();
        Assert.Equal(new[] { ServiceTestData.OtherCareerId }, persistedIds);
    }

    [Fact]
    public async Task ConfirmStudentCareerAsync_IsIdempotentForTheSameCareer()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new StudentEnrollmentService(context);

        await service.ConfirmStudentCareerAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.CareerId);
        await service.ConfirmStudentCareerAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.CareerId);

        Assert.Equal(
            1,
            await context.UserCareers.CountAsync(link =>
                link.UserId == ServiceTestData.StudentUserId));
    }

    [Fact]
    public async Task ConfirmStudentCareerAsync_RejectsInactiveCareerWithoutChangingLinks()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Career inactiveCareer = await context.Careers.SingleAsync(career =>
            career.Id == ServiceTestData.OtherCareerId);
        inactiveCareer.IsActive = false;
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var service = new StudentEnrollmentService(context);

        StudentEnrollmentException exception = await Assert.ThrowsAsync<StudentEnrollmentException>(() =>
            service.ConfirmStudentCareerAsync(
                ServiceTestData.StudentUserId,
                ServiceTestData.OtherCareerId));

        Assert.Equal("ACADEMIC_CAREER_INVALID", exception.Code);
        Assert.Equal(
            new[] { ServiceTestData.CareerId },
            await context.UserCareers
                .Where(link => link.UserId == ServiceTestData.StudentUserId)
                .Select(link => link.CareerId)
                .ToArrayAsync());
    }

    [Fact]
    public async Task ConfirmStudentCareerAsync_RejectsNonStudentActor()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new StudentEnrollmentService(context);

        StudentEnrollmentException exception = await Assert.ThrowsAsync<StudentEnrollmentException>(() =>
            service.ConfirmStudentCareerAsync(
                ServiceTestData.TeacherUserId,
                ServiceTestData.CareerId));

        Assert.Equal("AUTH_NOT_AUTHORIZED", exception.Code);
    }

    [Fact]
    public async Task ReplaceSelfServiceCareersAsync_RejectsMultipleCareersForStudent()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new StudentEnrollmentService(context);

        StudentEnrollmentException exception = await Assert.ThrowsAsync<StudentEnrollmentException>(() =>
            service.ReplaceSelfServiceCareersAsync(
                ServiceTestData.StudentUserId,
                new[] { ServiceTestData.CareerId, ServiceTestData.OtherCareerId }));

        Assert.Equal("ACADEMIC_STUDENT_SINGLE_CAREER_REQUIRED", exception.Code);
        Assert.Equal(
            new[] { ServiceTestData.CareerId },
            await context.UserCareers
                .Where(link => link.UserId == ServiceTestData.StudentUserId)
                .Select(link => link.CareerId)
                .ToArrayAsync());
    }

    [Fact]
    public async Task ReplaceSelfServiceCareersAsync_PreservesMultipleCareersForProfessor()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new StudentEnrollmentService(context);

        IReadOnlyList<Career> careers = await service.ReplaceSelfServiceCareersAsync(
            ServiceTestData.TeacherUserId,
            new[] { ServiceTestData.CareerId, ServiceTestData.OtherCareerId });

        Assert.Equal(2, careers.Count);
        Assert.Equal(
            new[] { ServiceTestData.CareerId, ServiceTestData.OtherCareerId },
            await context.UserCareers
                .Where(link => link.UserId == ServiceTestData.TeacherUserId)
                .OrderBy(link => link.CareerId)
                .Select(link => link.CareerId)
                .ToArrayAsync());
    }
}
