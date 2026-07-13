using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface ISocialGraphService
    {
        Task<IReadOnlyList<Guid>> GetFollowedUserIdsAsync(
            Guid observerId,
            CancellationToken cancellationToken = default);

        Task<FollowStatePayload> FollowUserAsync(
            Guid observerId,
            Guid targetUserId,
            CancellationToken cancellationToken = default);

        Task<FollowStatePayload> UnfollowUserAsync(
            Guid observerId,
            Guid targetUserId,
            CancellationToken cancellationToken = default);

        Task<UserInteraction> SetInteractionAsync(
            Guid observerId,
            Guid targetUserId,
            InteractionType type,
            CancellationToken cancellationToken = default);
    }

    public sealed record FollowStatePayload(Guid TargetUserId, bool IsFollowing);
}
