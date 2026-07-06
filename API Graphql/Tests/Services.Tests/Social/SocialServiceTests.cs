using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;
using Services.Social;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Social;

public sealed class SocialServiceTests
{
    private static readonly Guid OwnCareerInquiryId = Guid.Parse("10000000-0000-0000-0000-000000000001");
    private static readonly Guid OtherCareerInquiryId = Guid.Parse("10000000-0000-0000-0000-000000000002");
    private const int OtherSubjectId = 202;

    [Fact]
    public async Task GetInquiries_FiltersStudentFeedToOwnCareers()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        var service = new SocialService(context);

        List<Inquiry> inquiries = await service.GetInquiries(
                ServiceTestData.StudentUserId,
                null,
                null,
                null,
                null)
            .ToListAsync();

        Inquiry inquiry = Assert.Single(inquiries);
        Assert.Equal(OwnCareerInquiryId, inquiry.Id);
        Assert.Equal(ServiceTestData.CareerId, inquiry.Subject.CareerId);
    }

    [Fact]
    public async Task GetInquiries_ExcludesBlockedOrMutedAuthors()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        context.UserInteractions.Add(new UserInteraction
        {
            Id = Guid.NewGuid(),
            ObserverId = ServiceTestData.StudentUserId,
            TargetId = ServiceTestData.TeacherUserId,
            Type = InteractionType.Block
        });
        await context.SaveChangesAsync();
        var service = new SocialService(context);

        List<Inquiry> inquiries = await service.GetInquiries(
                ServiceTestData.StudentUserId,
                null,
                null,
                null,
                null)
            .ToListAsync();

        Assert.Empty(inquiries);
    }

    [Fact]
    public async Task GetInquiries_SearchFindsCommentContentAndAuthorEmail()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        var service = new SocialService(context);

        List<Inquiry> byComment = await service.GetInquiries(
                ServiceTestData.StudentUserId,
                "respuesta clave",
                null,
                null,
                null)
            .ToListAsync();
        List<Inquiry> byEmail = await service.GetInquiries(
                ServiceTestData.StudentUserId,
                "teacher@itbeltran.test",
                null,
                null,
                null)
            .ToListAsync();

        Assert.Single(byComment);
        Assert.Single(byEmail);
    }

    [Fact]
    public async Task AddInquiryAsync_PersistsValidUploadUrl()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new SocialService(context);

        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Material del parcial",
            "Comparto material autorizado",
            "/uploads/parcial.pdf");

        Assert.Equal("/uploads/parcial.pdf", inquiry.FileUrl);
        Assert.NotNull(inquiry.User);
        Assert.NotNull(inquiry.Subject);
    }

    [Fact]
    public async Task AddInquiryAsync_RejectsUnsafeUploadUrl()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new SocialService(context);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddInquiryAsync(
                ServiceTestData.StudentUserId,
                ServiceTestData.SubjectId,
                "Material invalido",
                "Intento de ruta insegura",
                "/uploads/../secrets.txt"));

        Assert.Contains("archivo", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.Inquiries);
    }

    [Fact]
    public async Task AddCommentAsync_CreatesNestedReplyWithinSameInquiry()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new SocialService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Consulta sobre arrays",
            "Necesito ejemplos de arrays");
        Comment parent = await service.AddCommentAsync(
            ServiceTestData.TeacherUserId,
            inquiry.Id,
            "Revisa la guia uno",
            null,
            null);

        Comment reply = await service.AddCommentAsync(
            ServiceTestData.StudentUserId,
            inquiry.Id,
            "Gracias por la respuesta",
            parent.Id,
            "/uploads/respuesta.png");

        Assert.Equal(parent.Id, reply.ParentCommentId);
        Assert.Equal(inquiry.Id, reply.InquiryId);
        Assert.Equal("/uploads/respuesta.png", reply.FileUrl);
        Assert.NotNull(reply.User);
        Assert.NotNull(reply.Inquiry);
    }

    [Fact]
    public async Task AddCommentAsync_RejectsReplyToCommentFromAnotherInquiry()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new SocialService(context);
        Inquiry first = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Primera consulta",
            "Contenido uno");
        Inquiry second = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Segunda consulta",
            "Contenido dos");
        Comment parent = await service.AddCommentAsync(
            ServiceTestData.TeacherUserId,
            first.Id,
            "Respuesta original",
            null,
            null);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddCommentAsync(
                ServiceTestData.StudentUserId,
                second.Id,
                "Respuesta cruzada",
                parent.Id,
                null));

        Assert.Contains("misma publicaci", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ToggleReactionAsync_CreatesThenRemovesReactionWithAccurateCount()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new SocialService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Consulta reaccionable",
            "Contenido para reaccionar");

        var first = await service.ToggleReactionAsync(ServiceTestData.TeacherUserId, inquiry.Id);
        var second = await service.ToggleReactionAsync(ServiceTestData.TeacherUserId, inquiry.Id);

        Assert.True(first.IsReacted);
        Assert.Equal(1, first.ReactionCount);
        Assert.False(second.IsReacted);
        Assert.Equal(0, second.ReactionCount);
        Assert.Empty(context.Reactions);
    }

    [Fact]
    public async Task AddInquiryAsync_RejectsMutedUserBeforePersisting()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var mutedUser = await context.Users.SingleAsync(user => user.Id == ServiceTestData.StudentUserId);
        mutedUser.MutedUntil = DateTime.UtcNow.AddHours(1);
        await context.SaveChangesAsync();
        var service = new SocialService(context);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddInquiryAsync(
                ServiceTestData.StudentUserId,
                ServiceTestData.SubjectId,
                "No deberia publicar",
                "Cuenta silenciada"));

        Assert.Contains("silenciada", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.Inquiries);
    }

    [Fact]
    public async Task AddCommentAsync_RejectsMutedUserBeforePersisting()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new SocialService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.TeacherUserId,
            ServiceTestData.SubjectId,
            "Publicacion docente",
            "Contenido base");
        var mutedUser = await context.Users.SingleAsync(user => user.Id == ServiceTestData.StudentUserId);
        mutedUser.MutedUntil = DateTime.UtcNow.AddHours(1);
        await context.SaveChangesAsync();

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddCommentAsync(
                ServiceTestData.StudentUserId,
                inquiry.Id,
                "No deberia comentar",
                null,
                null));

        Assert.Contains("silenciada", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.Comments);
    }

    private static async Task SeedSocialGraphAsync(OneItb.Data.OneItbContext context)
    {
        await ServiceTestData.SeedAcademicGraphAsync(context);
        context.Subjects.Add(new Subject
        {
            Id = OtherSubjectId,
            Name = "Proyecto Industrial",
            Code = "PIN1",
            CareerId = ServiceTestData.OtherCareerId,
            Year = 1,
            IsActive = true
        });
        context.Inquiries.AddRange(
            new Inquiry
            {
                Id = OwnCareerInquiryId,
                UserId = ServiceTestData.TeacherUserId,
                SubjectId = ServiceTestData.SubjectId,
                Title = "Parcial de programacion",
                Content = "Material de arrays",
                PublishDate = DateTime.UtcNow.AddMinutes(-10),
                IsActive = true
            },
            new Inquiry
            {
                Id = OtherCareerInquiryId,
                UserId = ServiceTestData.OtherStudentUserId,
                SubjectId = OtherSubjectId,
                Title = "Plano industrial",
                Content = "Material de otra carrera",
                PublishDate = DateTime.UtcNow,
                IsActive = true
            });
        context.Comments.Add(new Comment
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000001"),
            InquiryId = OwnCareerInquiryId,
            UserId = ServiceTestData.StudentUserId,
            Content = "respuesta clave para buscar",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
    }
}
