using GreenDonut;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;

namespace OneItb.GraphQL.Infrastructure
{
    public sealed class UserPostCountDataLoader : BatchDataLoader<Guid, int>
    {
        private readonly IDbContextFactory<OneItbContext> _dbContextFactory;

        public UserPostCountDataLoader(
            IBatchScheduler batchScheduler,
            IDbContextFactory<OneItbContext> dbContextFactory,
            DataLoaderOptions? options = null)
            : base(batchScheduler, options ?? new DataLoaderOptions())
        {
            _dbContextFactory = dbContextFactory;
        }

        protected override Task<IReadOnlyDictionary<Guid, int>> LoadBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken)
        {
            return MetricBatchLoader.LoadByUserAsync(
                _dbContextFactory,
                keys,
                context => context.Inquiries
                    .IgnoreQueryFilters()
                    .Select(inquiry => inquiry.UserId),
                cancellationToken);
        }
    }

    public sealed class UserCommentCountDataLoader : BatchDataLoader<Guid, int>
    {
        private readonly IDbContextFactory<OneItbContext> _dbContextFactory;

        public UserCommentCountDataLoader(
            IBatchScheduler batchScheduler,
            IDbContextFactory<OneItbContext> dbContextFactory,
            DataLoaderOptions? options = null)
            : base(batchScheduler, options ?? new DataLoaderOptions())
        {
            _dbContextFactory = dbContextFactory;
        }

        protected override Task<IReadOnlyDictionary<Guid, int>> LoadBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken)
        {
            return MetricBatchLoader.LoadByUserAsync(
                _dbContextFactory,
                keys,
                context => context.Comments
                    .IgnoreQueryFilters()
                    .Select(comment => comment.UserId),
                cancellationToken);
        }
    }

    public sealed class UserLikesReceivedCountDataLoader : BatchDataLoader<Guid, int>
    {
        private readonly IDbContextFactory<OneItbContext> _dbContextFactory;

        public UserLikesReceivedCountDataLoader(
            IBatchScheduler batchScheduler,
            IDbContextFactory<OneItbContext> dbContextFactory,
            DataLoaderOptions? options = null)
            : base(batchScheduler, options ?? new DataLoaderOptions())
        {
            _dbContextFactory = dbContextFactory;
        }

        protected override Task<IReadOnlyDictionary<Guid, int>> LoadBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken)
        {
            return MetricBatchLoader.LoadByUserAsync(
                _dbContextFactory,
                keys,
                context => context.Reactions
                    .IgnoreQueryFilters()
                    .Select(reaction => reaction.Inquiry.UserId),
                cancellationToken);
        }
    }

    public sealed class UserReportsReceivedCountDataLoader : BatchDataLoader<Guid, int>
    {
        private readonly IDbContextFactory<OneItbContext> _dbContextFactory;

        public UserReportsReceivedCountDataLoader(
            IBatchScheduler batchScheduler,
            IDbContextFactory<OneItbContext> dbContextFactory,
            DataLoaderOptions? options = null)
            : base(batchScheduler, options ?? new DataLoaderOptions())
        {
            _dbContextFactory = dbContextFactory;
        }

        protected override Task<IReadOnlyDictionary<Guid, int>> LoadBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken)
        {
            return MetricBatchLoader.LoadByUserAsync(
                _dbContextFactory,
                keys,
                context => context.CommunityReports
                    .IgnoreQueryFilters()
                    .Select(report => report.Inquiry.UserId),
                cancellationToken);
        }
    }

    public sealed class InquiryReportCountDataLoader : BatchDataLoader<Guid, int>
    {
        private readonly IDbContextFactory<OneItbContext> _dbContextFactory;

        public InquiryReportCountDataLoader(
            IBatchScheduler batchScheduler,
            IDbContextFactory<OneItbContext> dbContextFactory,
            DataLoaderOptions? options = null)
            : base(batchScheduler, options ?? new DataLoaderOptions())
        {
            _dbContextFactory = dbContextFactory;
        }

        protected override async Task<IReadOnlyDictionary<Guid, int>> LoadBatchAsync(
            IReadOnlyList<Guid> keys,
            CancellationToken cancellationToken)
        {
            await using OneItbContext context = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
            Dictionary<Guid, int> counts = await context.CommunityReports
                .IgnoreQueryFilters()
                .Where(report => keys.Contains(report.InquiryId))
                .GroupBy(report => report.InquiryId)
                .Select(group => new { Id = group.Key, Count = group.Count() })
                .ToDictionaryAsync(item => item.Id, item => item.Count, cancellationToken);

            return keys.ToDictionary(key => key, key => counts.TryGetValue(key, out int count) ? count : 0);
        }
    }

    internal static class MetricBatchLoader
    {
        public static async Task<IReadOnlyDictionary<Guid, int>> LoadByUserAsync(
            IDbContextFactory<OneItbContext> dbContextFactory,
            IReadOnlyList<Guid> keys,
            Func<OneItbContext, IQueryable<Guid>> keySelector,
            CancellationToken cancellationToken)
        {
            await using OneItbContext context = await dbContextFactory.CreateDbContextAsync(cancellationToken);
            Dictionary<Guid, int> counts = await keySelector(context)
                .Where(userId => keys.Contains(userId))
                .GroupBy(userId => userId)
                .Select(group => new { UserId = group.Key, Count = group.Count() })
                .ToDictionaryAsync(item => item.UserId, item => item.Count, cancellationToken);

            return keys.ToDictionary(key => key, key => counts.TryGetValue(key, out int count) ? count : 0);
        }
    }
}
