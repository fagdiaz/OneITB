using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using Services.Notifications;
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
    public async Task GetInquiriesPageAsync_FiltersStudentFeedToOwnCareers()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        SocialService service = CreateService(context);

        InquiryPage page = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            null,
            null,
            null,
            null,
            25,
            null);

        Inquiry inquiry = Assert.Single(page.Items);
        Assert.Equal(OwnCareerInquiryId, inquiry.Id);
        Assert.Equal(ServiceTestData.CareerId, inquiry.Subject.CareerId);
    }

    [Theory]
    [InlineData(InteractionType.Block)]
    [InlineData(InteractionType.Mute)]
    public async Task GetInquiriesPageAsync_ExcludesBlockedOrMutedAuthors(
        InteractionType interactionType)
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        context.UserInteractions.Add(new UserInteraction
        {
            Id = Guid.NewGuid(),
            ObserverId = ServiceTestData.StudentUserId,
            TargetId = ServiceTestData.TeacherUserId,
            Type = interactionType
        });
        await context.SaveChangesAsync();
        SocialService service = CreateService(context);

        InquiryPage page = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            null,
            null,
            null,
            null,
            25,
            null);

        Assert.Empty(page.Items);
    }

    [Fact]
    public async Task GetInquiriesPageAsync_PrioritizesFollowedAuthorsBeforeChronology()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        Guid newerInquiryId = Guid.Parse("10000000-0000-0000-0000-000000000003");
        context.Inquiries.Add(new Inquiry
        {
            Id = newerInquiryId,
            UserId = ServiceTestData.AdminUserId,
            SubjectId = ServiceTestData.SubjectId,
            Title = "Publicacion institucional reciente",
            Content = "Contenido reciente no seguido",
            PublishDate = DateTime.UtcNow.AddMinutes(-1),
            IsActive = true
        });
        context.UserInteractions.Add(new UserInteraction
        {
            Id = Guid.NewGuid(),
            ObserverId = ServiceTestData.StudentUserId,
            TargetId = ServiceTestData.TeacherUserId,
            Type = InteractionType.Follow,
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();
        SocialService service = CreateService(context);

        InquiryPage page = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            null,
            null,
            null,
            null,
            25,
            null);

        Assert.Equal(2, page.Items.Count);
        Assert.Equal(OwnCareerInquiryId, page.Items[0].Id);
        Assert.Equal(newerInquiryId, page.Items[1].Id);
    }

    [Fact]
    public async Task GetInquiriesPageAsync_SearchFindsCommentContentAndAuthorEmail()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        SocialService service = CreateService(context);

        InquiryPage byComment = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            "respuesta clave",
            null,
            null,
            null,
            25,
            null);
        InquiryPage byEmail = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            "teacher@itbeltran.test",
            null,
            null,
            null,
            25,
            null);

        Assert.Single(byComment.Items);
        Assert.Single(byEmail.Items);
    }

    [Fact]
    public async Task GetInquiriesPageAsync_ReturnsStableBoundedPages()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        DateTime publishDate = DateTime.UtcNow.AddMinutes(-5);
        context.Inquiries.AddRange(
            CreateInquiry(Guid.Parse("10000000-0000-0000-0000-000000000010"), ServiceTestData.AdminUserId, publishDate),
            CreateInquiry(Guid.Parse("10000000-0000-0000-0000-000000000011"), ServiceTestData.AdminUserId, publishDate),
            CreateInquiry(Guid.Parse("10000000-0000-0000-0000-000000000012"), ServiceTestData.AdminUserId, publishDate),
            CreateInquiry(Guid.Parse("10000000-0000-0000-0000-000000000013"), ServiceTestData.AdminUserId, publishDate));
        await context.SaveChangesAsync();
        SocialService service = CreateService(context);

        InquiryPage first = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            null,
            null,
            null,
            null,
            2,
            null);
        InquiryPage second = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            null,
            null,
            null,
            null,
            2,
            first.NextCursor);
        InquiryPage final = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            null,
            null,
            null,
            null,
            2,
            second.NextCursor);

        Assert.Equal(5, first.TotalCount);
        Assert.Equal(2, first.Items.Count);
        Assert.True(first.HasNextPage);
        Assert.NotEmpty(first.NextCursor);
        Assert.Equal(2, second.Items.Count);
        Assert.True(second.HasNextPage);
        Assert.Single(final.Items);
        Assert.False(final.HasNextPage);
        Assert.Empty(first.Items.Select(item => item.Id).Intersect(second.Items.Select(item => item.Id)));
        Assert.Empty(first.Items.Select(item => item.Id).Intersect(final.Items.Select(item => item.Id)));
        Assert.Empty(second.Items.Select(item => item.Id).Intersect(final.Items.Select(item => item.Id)));
    }

    [Theory]
    [InlineData(0, 0, false)]
    [InlineData(1, 1, false)]
    [InlineData(15, 15, false)]
    [InlineData(16, 15, true)]
    public async Task GetInquiriesPageAsync_ReportsExactBoundaryState(
        int matchingCount,
        int expectedItems,
        bool expectedHasNextPage)
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        DateTime publishDate = DateTime.UtcNow.AddMinutes(-5);
        IEnumerable<Inquiry> inquiries = Enumerable.Range(0, matchingCount).Select(index =>
        {
            Inquiry inquiry = CreateInquiry(
                Guid.Parse($"40000000-0000-0000-0000-{index:D12}"),
                ServiceTestData.AdminUserId,
                publishDate.AddSeconds(-index));
            inquiry.Title = $"Boundary marker {index}";
            return inquiry;
        });
        context.Inquiries.AddRange(inquiries);
        await context.SaveChangesAsync();
        SocialService service = CreateService(context);

        InquiryPage page = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            "Boundary marker",
            null,
            null,
            null,
            15,
            null);

        Assert.Equal(matchingCount, page.TotalCount);
        Assert.Equal(expectedItems, page.Items.Count);
        Assert.Equal(expectedHasNextPage, page.HasNextPage);
        Assert.Equal(expectedHasNextPage, !string.IsNullOrEmpty(page.NextCursor));
    }

    [Fact]
    public async Task GetInquiriesPageAsync_ClampsOversizedPageToTwentyFive()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        DateTime publishDate = DateTime.UtcNow.AddMinutes(-5);
        context.Inquiries.AddRange(Enumerable.Range(0, 29).Select(index =>
            CreateInquiry(
                Guid.Parse($"30000000-0000-0000-0000-{index:D12}"),
                ServiceTestData.AdminUserId,
                publishDate)));
        await context.SaveChangesAsync();
        SocialService service = CreateService(context);

        InquiryPage page = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            null,
            null,
            null,
            null,
            100,
            null);

        Assert.Equal(30, page.TotalCount);
        Assert.Equal(25, page.Items.Count);
        Assert.True(page.HasNextPage);
    }

    [Fact]
    public async Task GetInquiriesPageAsync_FiltersByAuthorBeforePaging()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        SocialService service = CreateService(context);

        InquiryPage page = await service.GetInquiriesPageAsync(
            ServiceTestData.StudentUserId,
            null,
            null,
            null,
            null,
            10,
            null,
            authorId: ServiceTestData.TeacherUserId);

        Inquiry inquiry = Assert.Single(page.Items);
        Assert.Equal(ServiceTestData.TeacherUserId, inquiry.UserId);
    }

    [Fact]
    public async Task GetInquiriesPageAsync_RejectsInvalidCursor()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        SocialService service = CreateService(context);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.GetInquiriesPageAsync(
                ServiceTestData.StudentUserId,
                null,
                null,
                null,
                null,
                10,
                "cursor-invalido"));

        Assert.Contains("paginacion", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetInquiriesPageAsync_PropagatesCancellation()
    {
        await using var context = ServiceTestData.CreateContext();
        await SeedSocialGraphAsync(context);
        SocialService service = CreateService(context);
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            service.GetInquiriesPageAsync(
                ServiceTestData.StudentUserId,
                null,
                null,
                null,
                null,
                10,
                null,
                cancellationToken: cancellation.Token));
    }

    [Fact]
    public async Task AddInquiryAsync_PersistsValidUploadUrl()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);

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
        SocialService service = CreateService(context);

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
    public async Task AddInquiryAsync_RejectsMoreThanTwoYouTubeLinks()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddInquiryAsync(
                ServiceTestData.StudentUserId,
                ServiceTestData.SubjectId,
                "Videos de la clase",
                "https://youtu.be/dQw4w9WgXcQ https://youtube.com/watch?v=9bZkp7q19f0 https://youtube.com/embed/M7lc1UVf-VE"));

        Assert.Contains("2 enlaces de YouTube", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.Inquiries);
    }

    [Fact]
    public async Task EditInquiryAsync_RejectsMoreThanTwoYouTubeLinksWithoutChangingContent()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Videos de la clase",
            "Contenido original");

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.EditInquiryAsync(
            ServiceTestData.StudentUserId,
            inquiry.Id,
            "Videos actualizados",
            "https://youtu.be/dQw4w9WgXcQ https://youtube.com/watch?v=9bZkp7q19f0 https://youtube.com/embed/M7lc1UVf-VE"));

        context.ChangeTracker.Clear();
        Inquiry persisted = await context.Inquiries.IgnoreQueryFilters().SingleAsync(item => item.Id == inquiry.Id);
        Assert.Equal("Contenido original", persisted.Content);
    }

    [Fact]
    public async Task AddCommentAsync_CreatesNestedReplyWithinSameInquiry()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
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
        SocialService service = CreateService(context);
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
    public async Task AddCommentAsync_RejectsThirdNestingLevel()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Consulta con profundidad",
            "Contenido base");
        Comment root = await service.AddCommentAsync(
            ServiceTestData.TeacherUserId,
            inquiry.Id,
            "Comentario principal",
            null);
        Comment reply = await service.AddCommentAsync(
            ServiceTestData.StudentUserId,
            inquiry.Id,
            "Respuesta permitida",
            root.Id);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddCommentAsync(
                ServiceTestData.TeacherUserId,
                inquiry.Id,
                "Respuesta demasiado profunda",
                reply.Id));

        Assert.Contains("dos niveles", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(2, context.Comments.Count());
    }

    [Fact]
    public async Task EditInquiryAsync_RejectsModeratorEditingAnotherUsersText()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Texto del autor",
            "Contenido original");

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.EditInquiryAsync(
                ServiceTestData.AdminUserId,
                inquiry.Id,
                "Texto institucional",
                "Contenido alterado"));

        Assert.Contains("permisos", exception.Message, StringComparison.OrdinalIgnoreCase);
        Inquiry persisted = await context.Inquiries.SingleAsync(item => item.Id == inquiry.Id);
        Assert.Equal("Texto del autor", persisted.Title);
        Assert.Equal("Contenido original", persisted.Content);
    }

    [Fact]
    public async Task EditInquiryAsync_ReplacesAttachmentsAndPersistsCoverPreference()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Material inicial",
            "Contenido inicial",
            attachments: new[]
            {
                new SocialAttachmentInput("/uploads/anterior.pdf", "Anterior.pdf", "application/pdf", 100, 0)
            });

        Inquiry updated = await service.EditInquiryAsync(
            ServiceTestData.StudentUserId,
            inquiry.Id,
            "Material actualizado",
            "Contenido actualizado",
            new[]
            {
                new SocialAttachmentInput("/uploads/portada.png", "Portada.png", "image/png", 200, 0),
                new SocialAttachmentInput("/uploads/nuevo.pdf", "Nuevo.pdf", "application/pdf", 300, 1)
            },
            true);

        Assert.True(updated.PreferAttachmentCover);
        Assert.Equal("/uploads/portada.png", updated.FileUrl);
        Assert.Equal(2, updated.Attachments.Count);
        Assert.DoesNotContain(context.SocialAttachments, item => item.FileUrl == "/uploads/anterior.pdf");
    }

    [Fact]
    public async Task ToggleReactionAsync_CreatesThenRemovesReactionWithAccurateCount()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
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
    public async Task ToggleReactionAsync_RejectsMutedUserBeforeAddingReaction()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        SocialService service = CreateService(context, notifications);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Consulta sin reacciones silenciadas",
            "Contenido base");
        User mutedUser = await context.Users.SingleAsync(
            user => user.Id == ServiceTestData.TeacherUserId);
        mutedUser.MutedUntil = DateTime.UtcNow.AddHours(1);
        await context.SaveChangesAsync();

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ToggleReactionAsync(ServiceTestData.TeacherUserId, inquiry.Id));

        Assert.Contains("silenciada", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(await context.Reactions.ToListAsync());
        notifications.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ToggleReactionAsync_RejectsMutedUserBeforeRemovingExistingReaction()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        SocialService service = CreateService(context, notifications);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Consulta con reaccion persistente",
            "Contenido base");
        ToggleReactionPayload existing = await service.ToggleReactionAsync(
            ServiceTestData.TeacherUserId,
            inquiry.Id);
        User mutedUser = await context.Users.SingleAsync(
            user => user.Id == ServiceTestData.TeacherUserId);
        mutedUser.MutedUntil = DateTime.UtcNow.AddHours(1);
        await context.SaveChangesAsync();
        notifications.Invocations.Clear();

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ToggleReactionAsync(ServiceTestData.TeacherUserId, inquiry.Id));

        Assert.Contains("silenciada", exception.Message, StringComparison.OrdinalIgnoreCase);
        Reaction persisted = Assert.Single(await context.Reactions.ToListAsync());
        Assert.Equal(existing.ReactionId, persisted.Id);
        notifications.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ToggleReactionAsync_PersonalMuteDoesNotSanctionTheTargetUser()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Consulta visible",
            "Contenido base");
        context.UserInteractions.Add(new UserInteraction
        {
            Id = Guid.NewGuid(),
            ObserverId = ServiceTestData.StudentUserId,
            TargetId = ServiceTestData.TeacherUserId,
            Type = InteractionType.Mute,
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        ToggleReactionPayload result = await service.ToggleReactionAsync(
            ServiceTestData.TeacherUserId,
            inquiry.Id);

        Assert.True(result.IsReacted);
        Assert.Single(await context.Reactions.ToListAsync());
    }

    [Fact]
    public async Task ToggleReactionAsync_PropagatesCancellationWithoutSideEffects()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Consulta cancelable",
            "Contenido base");
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            service.ToggleReactionAsync(
                ServiceTestData.TeacherUserId,
                inquiry.Id,
                cancellation.Token));

        Assert.Empty(await context.Reactions.ToListAsync());
    }

    [Fact]
    public async Task AddInquiryAsync_RejectsMutedUserBeforePersisting()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var mutedUser = await context.Users.SingleAsync(user => user.Id == ServiceTestData.StudentUserId);
        mutedUser.MutedUntil = DateTime.UtcNow.AddHours(1);
        await context.SaveChangesAsync();
        SocialService service = CreateService(context);

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
        SocialService service = CreateService(context);
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

    [Fact]
    public async Task AddInquiryAsync_RejectsSubjectOutsideStudentCareers()
    {
        await using var context = ServiceTestData.CreateContext();
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
        await context.SaveChangesAsync();
        SocialService service = CreateService(context);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddInquiryAsync(
                ServiceTestData.StudentUserId,
                OtherSubjectId,
                "Publicacion fuera de alcance",
                "No debe persistirse"));

        Assert.Contains("carreras", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.Inquiries);
    }

    [Fact]
    public async Task AddInquiryAsync_PersistsMultipleAttachmentDescriptors()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        var attachments = new[]
        {
            new SocialAttachmentInput("/uploads/guia.pdf", "Guia Original.pdf", "application/pdf", 1024, 0),
            new SocialAttachmentInput("/uploads/diagrama.png", "Diagrama.png", "image/png", 2048, 1)
        };

        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Material completo",
            "Incluye guia y diagrama",
            attachments: attachments);

        Assert.Equal("/uploads/guia.pdf", inquiry.FileUrl);
        Assert.Collection(
            inquiry.Attachments.OrderBy(item => item.SortOrder),
            first =>
            {
                Assert.Equal("Guia Original.pdf", first.OriginalFileName);
                Assert.Equal(1024, first.Size);
            },
            second =>
            {
                Assert.Equal("Diagrama.png", second.OriginalFileName);
                Assert.Equal(2048, second.Size);
            });
        Assert.Equal(2, context.SocialAttachments.Count());
    }

    [Fact]
    public async Task AddInquiryAsync_RejectsAttachmentAggregateOverFifteenMegabytes()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        long eightMegabytes = 8 * 1024 * 1024;
        var attachments = new[]
        {
            new SocialAttachmentInput("/uploads/uno.pdf", "Uno.pdf", "application/pdf", eightMegabytes, 0),
            new SocialAttachmentInput("/uploads/dos.pdf", "Dos.pdf", "application/pdf", eightMegabytes, 1)
        };

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddInquiryAsync(
                ServiceTestData.StudentUserId,
                ServiceTestData.SubjectId,
                "Demasiados archivos",
                "Supera el total permitido",
                attachments: attachments));

        Assert.Contains("15 MB", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(context.Inquiries);
        Assert.Empty(context.SocialAttachments);
    }

    [Fact]
    public async Task AddCommentAsync_AdminCommentNotifiesInquiryOwner()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        SocialService service = CreateService(context, notifications);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Consulta del estudiante",
            "Contenido base");

        await service.AddCommentAsync(
            ServiceTestData.AdminUserId,
            inquiry.Id,
            "Respuesta institucional",
            null);

        notifications.Verify(service => service.UpsertGroupedNotificationAsync(
            ServiceTestData.StudentUserId,
            NotificationType.SocialComment,
            inquiry.Id,
            $"social-comment:inquiry:{inquiry.Id:D}",
            It.IsAny<string>(),
            It.Is<string>(message => message.Contains("{count}", StringComparison.Ordinal)),
            It.IsAny<CancellationToken>(),
            It.Is<string>(url => url.StartsWith($"/feed?inquiryId={inquiry.Id:D}&commentId=", StringComparison.Ordinal))), Times.Once);
    }

    [Fact]
    public async Task AddCommentAsync_ReplyToReplyUsesRootAndNotifiesDirectedUser()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        SocialService service = CreateService(context, notifications);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Conversacion dirigida",
            "Contenido base");
        Comment root = await service.AddCommentAsync(
            ServiceTestData.TeacherUserId,
            inquiry.Id,
            "Comentario principal",
            null);
        Comment firstReply = await service.AddCommentAsync(
            ServiceTestData.OtherStudentUserId,
            inquiry.Id,
            "Primera respuesta",
            root.Id,
            replyTargetCommentId: root.Id);

        Comment directedReply = await service.AddCommentAsync(
            ServiceTestData.StudentUserId,
            inquiry.Id,
            "@Omar Respuesta dirigida",
            root.Id,
            replyTargetCommentId: firstReply.Id);

        Assert.Equal(root.Id, directedReply.ParentCommentId);
        Assert.Equal(ServiceTestData.OtherStudentUserId, directedReply.ReplyToUserId);
        Assert.NotNull(directedReply.ReplyToUser);
        notifications.Verify(notificationService => notificationService.UpsertGroupedNotificationAsync(
            ServiceTestData.OtherStudentUserId,
            NotificationType.SocialComment,
            inquiry.Id,
            $"social-mention:inquiry:{inquiry.Id:D}:user:{ServiceTestData.OtherStudentUserId:D}",
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>(),
            $"/feed?inquiryId={inquiry.Id:D}&commentId={directedReply.Id:D}"), Times.Once);
    }

    [Fact]
    public async Task AddCommentAsync_DoesNotNotifyUserForSelfMention()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        SocialService service = CreateService(context, notifications);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.TeacherUserId,
            ServiceTestData.SubjectId,
            "Conversacion sin auto notificacion",
            "Contenido base");
        Comment root = await service.AddCommentAsync(
            ServiceTestData.StudentUserId,
            inquiry.Id,
            "Comentario propio",
            null);

        Comment reply = await service.AddCommentAsync(
            ServiceTestData.StudentUserId,
            inquiry.Id,
            "@Leandro Aclaracion propia",
            root.Id,
            replyTargetCommentId: root.Id);

        Assert.Equal(ServiceTestData.StudentUserId, reply.ReplyToUserId);
        notifications.Verify(notificationService => notificationService.UpsertGroupedNotificationAsync(
            ServiceTestData.StudentUserId,
            NotificationType.SocialComment,
            inquiry.Id,
            It.Is<string>(key => key.StartsWith("social-mention:", StringComparison.Ordinal)),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>(),
            It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task AddCommentAsync_RejectsReplyTargetFromAnotherInquiry()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        Inquiry firstInquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Primer hilo",
            "Contenido base");
        Inquiry secondInquiry = await service.AddInquiryAsync(
            ServiceTestData.TeacherUserId,
            ServiceTestData.SubjectId,
            "Segundo hilo",
            "Contenido base");
        Comment foreignTarget = await service.AddCommentAsync(
            ServiceTestData.StudentUserId,
            secondInquiry.Id,
            "Comentario de otro hilo",
            null);
        int before = await context.Comments.CountAsync();

        InvalidOperationException error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddCommentAsync(
                ServiceTestData.TeacherUserId,
                firstInquiry.Id,
                "Respuesta invalida",
                null,
                replyTargetCommentId: foreignTarget.Id));

        Assert.Contains("no existe", error.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(before, await context.Comments.CountAsync());
    }

    [Fact]
    public async Task ToggleReactionAsync_NotifiesOwnerOnlyWhenReactionIsAdded()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        Mock<INotificationService> notifications = CreateNotificationMock();
        SocialService service = CreateService(context, notifications);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Publicacion reaccionable",
            "Contenido base");

        ToggleReactionPayload added = await service.ToggleReactionAsync(ServiceTestData.TeacherUserId, inquiry.Id);
        ToggleReactionPayload removed = await service.ToggleReactionAsync(ServiceTestData.TeacherUserId, inquiry.Id);

        Assert.True(added.IsReacted);
        Assert.NotNull(added.ReactionId);
        Assert.False(removed.IsReacted);
        notifications.Verify(service => service.UpsertGroupedNotificationAsync(
            ServiceTestData.StudentUserId,
            NotificationType.SocialReaction,
            inquiry.Id,
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>(),
            null), Times.Once);
    }

    [Fact]
    public async Task ToggleCommentReactionAsync_PersistsAndRemovesNestedCommentLike()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Hilo social",
            "Contenido base");
        Comment comment = await service.AddCommentAsync(
            ServiceTestData.TeacherUserId,
            inquiry.Id,
            "Comentario docente",
            null);

        ToggleCommentReactionPayload added = await service.ToggleCommentReactionAsync(
            ServiceTestData.StudentUserId,
            comment.Id);
        ToggleCommentReactionPayload removed = await service.ToggleCommentReactionAsync(
            ServiceTestData.StudentUserId,
            comment.Id);

        Assert.True(added.IsReacted);
        Assert.Equal(1, added.ReactionCount);
        Assert.False(removed.IsReacted);
        Assert.Equal(0, removed.ReactionCount);
        Assert.Empty(context.CommentReactions);
    }

    [Fact]
    public async Task GetInquiryReactionUsersPageAsync_RequiresOwnerOrModerator()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        SocialService service = CreateService(context);
        Inquiry inquiry = await service.AddInquiryAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.SubjectId,
            "Likes visibles al autor",
            "Contenido base");
        await service.ToggleReactionAsync(ServiceTestData.TeacherUserId, inquiry.Id);

        ReactionUserPage page = await service.GetInquiryReactionUsersPageAsync(
            ServiceTestData.StudentUserId,
            false,
            inquiry.Id,
            10,
            null);
        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.GetInquiryReactionUsersPageAsync(
                ServiceTestData.OtherStudentUserId,
                false,
                inquiry.Id,
                10,
                null));

        User user = Assert.Single(page.Items);
        Assert.Equal(ServiceTestData.TeacherUserId, user.Id);
        Assert.Contains("permisos", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    private static SocialService CreateService(
        OneItb.Data.OneItbContext context,
        Mock<INotificationService>? notifications = null)
    {
        return new SocialService(
            context,
            (notifications ?? CreateNotificationMock()).Object,
            Mock.Of<ILogger<SocialService>>());
    }

    private static Mock<INotificationService> CreateNotificationMock()
    {
        var notifications = new Mock<INotificationService>(MockBehavior.Loose);
        notifications
            .Setup(service => service.UpsertGroupedNotificationAsync(
                It.IsAny<Guid>(),
                It.IsAny<NotificationType>(),
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<string?>()))
            .ReturnsAsync((Notification?)null);
        return notifications;
    }

    private static Inquiry CreateInquiry(Guid id, Guid userId, DateTime publishDate)
    {
        return new Inquiry
        {
            Id = id,
            UserId = userId,
            SubjectId = ServiceTestData.SubjectId,
            Title = $"Publicacion {id:N}",
            Content = "Contenido paginado",
            PublishDate = publishDate,
            IsActive = true
        };
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
