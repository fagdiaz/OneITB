using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Social
{
    public sealed class SocialGraphService : ISocialGraphService
    {
        private const int MaxWriteAttempts = 3;
        private readonly OneItbContext _context;

        public SocialGraphService(OneItbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Guid>> GetFollowedUserIdsAsync(
            Guid observerId,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveObserverAsync(observerId, cancellationToken);
            return await _context.UserInteractions
                .AsNoTracking()
                .Where(interaction =>
                    interaction.ObserverId == observerId &&
                    interaction.Type == InteractionType.Follow &&
                    interaction.Target.IsActive)
                .OrderBy(interaction => interaction.TargetId)
                .Select(interaction => interaction.TargetId)
                .ToListAsync(cancellationToken);
        }

        public async Task<FollowStatePayload> FollowUserAsync(
            Guid observerId,
            Guid targetUserId,
            CancellationToken cancellationToken = default)
        {
            await EnsureValidPairAsync(observerId, targetUserId, cancellationToken);

            bool isBlocked = await _context.UserInteractions
                .AsNoTracking()
                .AnyAsync(interaction =>
                    interaction.ObserverId == observerId &&
                    interaction.TargetId == targetUserId &&
                    interaction.Type == InteractionType.Block,
                    cancellationToken);
            if (isBlocked)
                throw new InvalidOperationException("Desbloquea al usuario antes de seguirlo.");

            for (int attempt = 0; attempt < MaxWriteAttempts; attempt++)
            {
                bool exists = await _context.UserInteractions
                    .AsNoTracking()
                    .AnyAsync(interaction =>
                        interaction.ObserverId == observerId &&
                        interaction.TargetId == targetUserId &&
                        interaction.Type == InteractionType.Follow,
                        cancellationToken);
                if (exists)
                    return new FollowStatePayload(targetUserId, true);

                var interaction = new UserInteraction
                {
                    Id = Guid.NewGuid(),
                    ObserverId = observerId,
                    TargetId = targetUserId,
                    Type = InteractionType.Follow,
                    CreatedAt = DateTime.UtcNow
                };
                _context.UserInteractions.Add(interaction);

                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                    return new FollowStatePayload(targetUserId, true);
                }
                catch (DbUpdateException) when (attempt < MaxWriteAttempts - 1)
                {
                    _context.Entry(interaction).State = EntityState.Detached;
                }
            }

            throw new InvalidOperationException("No se pudo guardar la relacion de seguimiento por concurrencia.");
        }

        public async Task<FollowStatePayload> UnfollowUserAsync(
            Guid observerId,
            Guid targetUserId,
            CancellationToken cancellationToken = default)
        {
            await EnsureValidPairAsync(observerId, targetUserId, cancellationToken);

            UserInteraction? follow = await _context.UserInteractions
                .SingleOrDefaultAsync(interaction =>
                    interaction.ObserverId == observerId &&
                    interaction.TargetId == targetUserId &&
                    interaction.Type == InteractionType.Follow,
                    cancellationToken);
            if (follow is null)
                return new FollowStatePayload(targetUserId, false);

            _context.UserInteractions.Remove(follow);
            try
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                _context.Entry(follow).State = EntityState.Detached;
            }
            return new FollowStatePayload(targetUserId, false);
        }

        public async Task<UserInteraction> SetInteractionAsync(
            Guid observerId,
            Guid targetUserId,
            InteractionType type,
            CancellationToken cancellationToken = default)
        {
            if (type == InteractionType.Follow)
            {
                await FollowUserAsync(observerId, targetUserId, cancellationToken);
                return await _context.UserInteractions
                    .AsNoTracking()
                    .SingleAsync(interaction =>
                        interaction.ObserverId == observerId &&
                        interaction.TargetId == targetUserId &&
                        interaction.Type == InteractionType.Follow,
                        cancellationToken);
            }

            await EnsureValidPairAsync(observerId, targetUserId, cancellationToken);
            List<UserInteraction> interactions = await _context.UserInteractions
                .Where(interaction =>
                    interaction.ObserverId == observerId &&
                    interaction.TargetId == targetUserId)
                .ToListAsync(cancellationToken);

            UserInteraction? existing = interactions.SingleOrDefault(interaction => interaction.Type == type);
            if (type == InteractionType.Mute)
            {
                if (interactions.Any(interaction => interaction.Type == InteractionType.Block))
                    throw new InvalidOperationException("Desbloquea al usuario antes de silenciarlo.");
                if (existing is not null)
                    return existing;
            }

            if (type == InteractionType.Block)
            {
                UserInteraction[] incompatible = interactions
                    .Where(interaction => interaction.Type != InteractionType.Block)
                    .ToArray();
                _context.UserInteractions.RemoveRange(incompatible);
                if (existing is not null)
                {
                    if (incompatible.Length > 0)
                        await _context.SaveChangesAsync(cancellationToken);
                    return existing;
                }
            }

            var interaction = new UserInteraction
            {
                Id = Guid.NewGuid(),
                ObserverId = observerId,
                TargetId = targetUserId,
                Type = type,
                CreatedAt = DateTime.UtcNow
            };
            _context.UserInteractions.Add(interaction);
            await _context.SaveChangesAsync(cancellationToken);
            return interaction;
        }

        private async Task EnsureValidPairAsync(
            Guid observerId,
            Guid targetUserId,
            CancellationToken cancellationToken)
        {
            if (observerId == Guid.Empty || targetUserId == Guid.Empty)
                throw new ArgumentException("Los usuarios de la interaccion son obligatorios.");
            if (observerId == targetUserId)
                throw new InvalidOperationException("No podes interactuar socialmente con tu propio usuario.");

            bool observerExists = await _context.Users
                .AsNoTracking()
                .AnyAsync(user => user.Id == observerId && user.IsActive, cancellationToken);
            if (!observerExists)
                throw new InvalidOperationException("El usuario autenticado no esta disponible.");

            bool targetExists = await _context.Users
                .AsNoTracking()
                .AnyAsync(user => user.Id == targetUserId && user.IsActive, cancellationToken);
            if (!targetExists)
                throw new InvalidOperationException("El usuario objetivo no existe o esta inactivo.");
        }

        private async Task EnsureActiveObserverAsync(Guid observerId, CancellationToken cancellationToken)
        {
            if (observerId == Guid.Empty || !await _context.Users
                    .AsNoTracking()
                    .AnyAsync(user => user.Id == observerId && user.IsActive, cancellationToken))
            {
                throw new InvalidOperationException("El usuario autenticado no esta disponible.");
            }
        }
    }
}
