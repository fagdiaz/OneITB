using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using Services.Social;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Social;

public sealed class SocialGraphServiceTests
{
    [Fact]
    public async Task FollowUserAsync_IsIdempotentAndCoexistsWithMute()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new SocialGraphService(context);

        await service.SetInteractionAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.TeacherUserId,
            InteractionType.Mute);
        FollowStatePayload first = await service.FollowUserAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.TeacherUserId);
        FollowStatePayload second = await service.FollowUserAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.TeacherUserId);

        Assert.True(first.IsFollowing);
        Assert.True(second.IsFollowing);
        Assert.Equal(2, await context.UserInteractions.CountAsync());
        Assert.Contains(context.UserInteractions, edge => edge.Type == InteractionType.Follow);
        Assert.Contains(context.UserInteractions, edge => edge.Type == InteractionType.Mute);
    }

    [Fact]
    public async Task UnfollowUserAsync_RemovesOnlyFollowEdge()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new SocialGraphService(context);
        await service.SetInteractionAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.TeacherUserId,
            InteractionType.Mute);
        await service.FollowUserAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.TeacherUserId);

        FollowStatePayload result = await service.UnfollowUserAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.TeacherUserId);

        Assert.False(result.IsFollowing);
        UserInteraction remaining = Assert.Single(context.UserInteractions);
        Assert.Equal(InteractionType.Mute, remaining.Type);
    }

    [Fact]
    public async Task Block_RemovesIncompatibleEdgesAndPreventsFollow()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new SocialGraphService(context);
        await service.SetInteractionAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.TeacherUserId,
            InteractionType.Mute);
        await service.FollowUserAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.TeacherUserId);

        UserInteraction block = await service.SetInteractionAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.TeacherUserId,
            InteractionType.Block);

        Assert.Equal(InteractionType.Block, block.Type);
        Assert.Equal(InteractionType.Block, Assert.Single(context.UserInteractions).Type);
        InvalidOperationException error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.FollowUserAsync(
                ServiceTestData.StudentUserId,
                ServiceTestData.TeacherUserId));
        Assert.Contains("Desbloquea", error.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task FollowUserAsync_RejectsSelfAndInactiveTarget()
    {
        await using var context = ServiceTestData.CreateContext();
        await ServiceTestData.SeedAcademicGraphAsync(context);
        var service = new SocialGraphService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.FollowUserAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.StudentUserId));
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.FollowUserAsync(
            ServiceTestData.StudentUserId,
            ServiceTestData.InactiveUserId));
    }
}
