using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Auth
{
    public sealed record MicrosoftEntraIdentity(
        string TenantId,
        string SubjectId,
        string Email,
        string FirstName,
        string LastName);

    public interface IMicrosoftEntraTokenValidator
    {
        Task<MicrosoftEntraIdentity> ValidateAsync(
            string accessToken,
            CancellationToken cancellationToken = default);
    }

    public interface IMicrosoftEntraAuthService
    {
        Task<AuthPayload> LoginAsync(
            string accessToken,
            string clientSource,
            string? correlationId,
            CancellationToken cancellationToken = default);
    }

    public interface IMicrosoftEntraRateLimiter
    {
        Task<MicrosoftEntraRateLimitDecision> TryAcquireClientAsync(
            string clientSource,
            CancellationToken cancellationToken = default);

        Task<MicrosoftEntraRateLimitDecision> TryAcquireIdentityAsync(
            string tenantId,
            string subjectId,
            CancellationToken cancellationToken = default);
    }

    public sealed record MicrosoftEntraRateLimitDecision(
        bool IsAllowed,
        TimeSpan? RetryAfter)
    {
        public static MicrosoftEntraRateLimitDecision Allowed() => new(true, null);

        public static MicrosoftEntraRateLimitDecision Rejected(TimeSpan retryAfter) =>
            new(false, retryAfter < TimeSpan.Zero ? TimeSpan.Zero : retryAfter);
    }

    public sealed class MicrosoftEntraAuthenticationException : Exception
    {
        public MicrosoftEntraAuthenticationException(string code, string message)
            : base(message)
        {
            Code = code;
        }

        public string Code { get; }
    }
}
