namespace OneItb.GraphQL.Services.Security
{
    public interface IMagicLinkRateLimiter
    {
        Task<MagicLinkRateLimitDecision> TryAcquireRequestAsync(
            string clientSource,
            string email,
            CancellationToken cancellationToken = default);

        Task<MagicLinkRateLimitDecision> TryAcquireRedemptionAsync(
            string clientSource,
            string credential,
            CancellationToken cancellationToken = default);
    }

    public sealed record MagicLinkRateLimitDecision(
        bool IsAllowed,
        TimeSpan? RetryAfter,
        string ReasonCode)
    {
        public static MagicLinkRateLimitDecision Allowed()
            => new(true, null, "allowed");

        public static MagicLinkRateLimitDecision RateLimited(TimeSpan retryAfter)
            => new(false, retryAfter < TimeSpan.Zero ? TimeSpan.Zero : retryAfter, "rate-limited");

        public static MagicLinkRateLimitDecision ProviderUnavailable()
            => new(false, TimeSpan.FromSeconds(30), "provider-unavailable");
    }
}
