using System.Data;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Auth
{
    public sealed class MicrosoftEntraAuthService : IMicrosoftEntraAuthService
    {
        private readonly OneItbContext _context;
        private readonly IMicrosoftEntraTokenValidator _tokenValidator;
        private readonly IMicrosoftEntraRateLimiter _rateLimiter;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly TimeProvider _timeProvider;
        private readonly ILogger<MicrosoftEntraAuthService> _logger;

        public MicrosoftEntraAuthService(
            OneItbContext context,
            IMicrosoftEntraTokenValidator tokenValidator,
            IMicrosoftEntraRateLimiter rateLimiter,
            IJwtTokenService jwtTokenService,
            TimeProvider timeProvider,
            ILogger<MicrosoftEntraAuthService> logger)
        {
            _context = context;
            _tokenValidator = tokenValidator;
            _rateLimiter = rateLimiter;
            _jwtTokenService = jwtTokenService;
            _timeProvider = timeProvider;
            _logger = logger;
        }

        public async Task<AuthPayload> LoginAsync(
            string accessToken,
            string clientSource,
            string? correlationId,
            CancellationToken cancellationToken = default)
        {
            MicrosoftEntraRateLimitDecision clientDecision =
                await _rateLimiter.TryAcquireClientAsync(
                    clientSource,
                    cancellationToken);
            if (!clientDecision.IsAllowed)
            {
                var exception = new MicrosoftEntraAuthenticationException(
                    "ENTRA_RATE_LIMITED",
                    "Demasiados intentos de acceso institucional. Intenta nuevamente más tarde.");
                await RecordRejectedAuditSafelyAsync(
                    exception.Code,
                    correlationId,
                    cancellationToken);
                throw exception;
            }

            MicrosoftEntraIdentity identity;
            try
            {
                identity = await _tokenValidator.ValidateAsync(
                    accessToken,
                    cancellationToken);
            }
            catch (MicrosoftEntraAuthenticationException exception)
            {
                await RecordRejectedAuditSafelyAsync(
                    exception.Code,
                    correlationId,
                    cancellationToken);
                throw;
            }

            MicrosoftEntraRateLimitDecision identityDecision =
                await _rateLimiter.TryAcquireIdentityAsync(
                    identity.TenantId,
                    identity.SubjectId,
                    cancellationToken);
            if (!identityDecision.IsAllowed)
            {
                var exception = new MicrosoftEntraAuthenticationException(
                    "ENTRA_RATE_LIMITED",
                    "Demasiados intentos de acceso institucional. Intenta nuevamente más tarde.");
                await RecordRejectedAuditSafelyAsync(
                    exception.Code,
                    correlationId,
                    cancellationToken);
                throw exception;
            }

            try
            {
                return await LinkOrProvisionAsync(
                    identity,
                    correlationId,
                    cancellationToken);
            }
            catch (MicrosoftEntraAuthenticationException exception)
            {
                _context.ChangeTracker.Clear();
                await RecordRejectedAuditSafelyAsync(
                    exception.Code,
                    correlationId,
                    cancellationToken);
                throw;
            }
            catch (DbUpdateException exception)
            {
                _context.ChangeTracker.Clear();
                const string code = "ENTRA_ACCOUNT_CONFLICT";
                _logger.LogWarning(
                    exception,
                    "Microsoft Entra account linking hit a database uniqueness conflict. CorrelationId={CorrelationId}",
                    BoundCorrelationId(correlationId));
                await RecordRejectedAuditSafelyAsync(
                    code,
                    correlationId,
                    cancellationToken);
                throw new MicrosoftEntraAuthenticationException(
                    code,
                    "La identidad institucional no puede vincularse a esta cuenta.");
            }
        }

        private async Task<AuthPayload> LinkOrProvisionAsync(
            MicrosoftEntraIdentity identity,
            string? correlationId,
            CancellationToken cancellationToken)
        {
            IDbContextTransaction? transaction = null;
            if (_context.Database.IsRelational())
            {
                transaction = await _context.Database.BeginTransactionAsync(
                    IsolationLevel.Serializable,
                    cancellationToken);
            }

            await using (transaction)
            {
                Account? account = await _context.Accounts
                    .Include(item => item.User)
                    .SingleOrDefaultAsync(
                        item =>
                            item.ExternalProvider == MicrosoftEntraOptions.ProviderName &&
                            item.ExternalTenantId == identity.TenantId &&
                            item.ExternalSubjectId == identity.SubjectId,
                        cancellationToken);

                if (account is null)
                {
                    account = await _context.Accounts
                        .Include(item => item.User)
                        .SingleOrDefaultAsync(
                            item => item.Email == identity.Email,
                            cancellationToken);
                }

                User user;
                if (account is null)
                {
                    Guid userId = Guid.NewGuid();
                    account = new Account
                    {
                        Id = userId,
                        Email = identity.Email,
                        PasswordHash = null,
                        ExternalProvider = MicrosoftEntraOptions.ProviderName,
                        ExternalTenantId = identity.TenantId,
                        ExternalSubjectId = identity.SubjectId,
                        CreatedAt = _timeProvider.GetUtcNow().UtcDateTime
                    };
                    user = new User
                    {
                        Id = userId,
                        FirstName = identity.FirstName,
                        LastName = identity.LastName,
                        Role = "Estudiante",
                        IsActive = true,
                        IsPublicProfile = true,
                        Account = account
                    };
                    account.User = user;
                    await _context.Users.AddAsync(user, cancellationToken);
                }
                else
                {
                    user = account.User;
                    EnsureCompatibleLink(account, identity);
                    if (!account.HasExternalIdentity)
                    {
                        if (RequiresApprovedPrivilegedLink(user.Role))
                        {
                            throw new MicrosoftEntraAuthenticationException(
                                "ENTRA_ACCOUNT_CONFLICT",
                                "La identidad institucional requiere una vinculación administrada.");
                        }

                        account.ExternalProvider = MicrosoftEntraOptions.ProviderName;
                        account.ExternalTenantId = identity.TenantId;
                        account.ExternalSubjectId = identity.SubjectId;
                    }
                }

                if (!user.IsActive)
                {
                    throw new MicrosoftEntraAuthenticationException(
                        "ENTRA_ACCOUNT_DISABLED",
                        "La cuenta institucional no está habilitada en OneITB.");
                }

                account.LastExternalLoginAt = _timeProvider.GetUtcNow().UtcDateTime;
                _context.AuditLogs.Add(CreateAudit(
                    user.Id,
                    "Accepted",
                    "ENTRA_LOGIN_ACCEPTED",
                    correlationId));

                await _context.SaveChangesAsync(cancellationToken);
                if (transaction is not null)
                    await transaction.CommitAsync(cancellationToken);

                string localToken = _jwtTokenService.IssueAccessToken(user);
                return new AuthPayload(
                    localToken,
                    user.FirstName,
                    true,
                    user.Id,
                    user.Role,
                    account.Email);
            }
        }

        private static void EnsureCompatibleLink(
            Account account,
            MicrosoftEntraIdentity identity)
        {
            bool hasAnyExternalField =
                !string.IsNullOrWhiteSpace(account.ExternalProvider) ||
                !string.IsNullOrWhiteSpace(account.ExternalTenantId) ||
                !string.IsNullOrWhiteSpace(account.ExternalSubjectId);

            if (!hasAnyExternalField)
                return;

            bool isSameIdentity =
                string.Equals(
                    account.ExternalProvider,
                    MicrosoftEntraOptions.ProviderName,
                    StringComparison.Ordinal) &&
                string.Equals(
                    account.ExternalTenantId,
                    identity.TenantId,
                    StringComparison.OrdinalIgnoreCase) &&
                string.Equals(
                    account.ExternalSubjectId,
                    identity.SubjectId,
                    StringComparison.Ordinal);

            if (!account.HasExternalIdentity || !isSameIdentity)
            {
                throw new MicrosoftEntraAuthenticationException(
                    "ENTRA_ACCOUNT_CONFLICT",
                    "La identidad institucional no puede vincularse a esta cuenta.");
            }
        }

        private static bool RequiresApprovedPrivilegedLink(string role) =>
            role is "Administrador" or "Moderador" or "Profesor" or "Empleador";

        private async Task RecordRejectedAuditSafelyAsync(
            string code,
            string? correlationId,
            CancellationToken cancellationToken)
        {
            try
            {
                _context.AuditLogs.Add(CreateAudit(
                    null,
                    "Rejected",
                    code,
                    correlationId));
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "Could not persist sanitized Microsoft Entra rejection audit. Code={Code} CorrelationId={CorrelationId}",
                    code,
                    BoundCorrelationId(correlationId));
            }
        }

        private AuditLog CreateAudit(
            Guid? actorUserId,
            string outcome,
            string code,
            string? correlationId)
        {
            return new AuditLog
            {
                Id = Guid.NewGuid(),
                ActorUserId = actorUserId,
                CorrelationId = BoundCorrelationId(correlationId),
                Action = "ExternalLogin",
                EntityName = "Authentication",
                EntityId = actorUserId?.ToString("D") ?? "anonymous",
                NewValuesJson = JsonSerializer.Serialize(new
                {
                    provider = MicrosoftEntraOptions.ProviderName,
                    outcome,
                    code
                }),
                CreatedAt = _timeProvider.GetUtcNow().UtcDateTime
            };
        }

        private static string? BoundCorrelationId(string? correlationId)
        {
            string? value = correlationId?.Trim();
            if (string.IsNullOrWhiteSpace(value))
                return null;
            return value[..Math.Min(value.Length, 128)];
        }
    }
}
