using HotChocolate.Execution;
using HotChocolate.Execution.Configuration;
using HotChocolate.Subscriptions;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using Xunit;

namespace Services.Tests.Infrastructure;

public sealed class RedisIntegrationTests
{
    [Fact]
    [Trait("Category", "Infrastructure")]
    public async Task RedisSubscriptions_DeliverAcrossProvidersWithoutTopicLeak()
    {
        if (!InfrastructureTestEnvironment.IsEnabled)
            return;

        string connectionString = InfrastructureTestEnvironment.Require(
            "ONEITB_TEST_REDIS_CONNECTION");
        await using RedisProvider receiverProvider = await RedisProvider.CreateAsync(
            connectionString);
        await using RedisProvider senderProvider = await RedisProvider.CreateAsync(
            connectionString);

        TimeSpan ping = await receiverProvider.Connection.GetDatabase().PingAsync();
        Assert.True(ping < TimeSpan.FromSeconds(5));

        string runId = Guid.NewGuid().ToString("N");
        string intendedTopic = $"acceptance:intended:{runId}";
        string unrelatedTopic = $"acceptance:unrelated:{runId}";
        await using ISourceStream<ProbeEvent> intendedStream =
            await receiverProvider.Receiver.SubscribeAsync<ProbeEvent>(intendedTopic);
        await using ISourceStream<ProbeEvent> unrelatedStream =
            await receiverProvider.Receiver.SubscribeAsync<ProbeEvent>(unrelatedTopic);

        using var collectionTimeout = new CancellationTokenSource(TimeSpan.FromSeconds(3));
        Task<IReadOnlyList<ProbeEvent>> intendedCollection = CollectAsync(
            intendedStream,
            collectionTimeout.Token);
        Task<IReadOnlyList<ProbeEvent>> unrelatedCollection = CollectAsync(
            unrelatedStream,
            collectionTimeout.Token);
        await Task.Delay(TimeSpan.FromMilliseconds(250));

        var expected = new ProbeEvent(runId, "moderator-recipient");
        await senderProvider.Sender.SendAsync(
            intendedTopic,
            expected,
            collectionTimeout.Token);

        IReadOnlyList<ProbeEvent> intended = await intendedCollection;
        IReadOnlyList<ProbeEvent> unrelated = await unrelatedCollection;

        ProbeEvent received = Assert.Single(intended);
        Assert.Equal(expected, received);
        Assert.Empty(unrelated);
    }

    private static async Task<IReadOnlyList<ProbeEvent>> CollectAsync(
        ISourceStream<ProbeEvent> stream,
        CancellationToken cancellationToken)
    {
        var events = new List<ProbeEvent>();
        try
        {
            await foreach (ProbeEvent item in stream
                .ReadEventsAsync()
                .WithCancellation(cancellationToken))
            {
                events.Add(item);
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
        }

        return events;
    }

    public sealed record ProbeEvent(string Id, string Recipient);

    public sealed class ProbeQuery
    {
        public string Health() => "ok";
    }

    private sealed class RedisProvider : IAsyncDisposable
    {
        private readonly ServiceProvider _serviceProvider;

        private RedisProvider(
            ServiceProvider serviceProvider,
            IConnectionMultiplexer connection,
            ITopicEventReceiver receiver,
            ITopicEventSender sender)
        {
            _serviceProvider = serviceProvider;
            Connection = connection;
            Receiver = receiver;
            Sender = sender;
        }

        public IConnectionMultiplexer Connection { get; }

        public ITopicEventReceiver Receiver { get; }

        public ITopicEventSender Sender { get; }

        public static async Task<RedisProvider> CreateAsync(string connectionString)
        {
            var services = new ServiceCollection();
            services.AddSingleton<IConnectionMultiplexer>(
                _ => ConnectionMultiplexer.Connect(connectionString));
            IRequestExecutorBuilder graphQlBuilder = services
                .AddGraphQLServer()
                .AddQueryType<ProbeQuery>();
            graphQlBuilder.AddRedisSubscriptions(
                serviceProvider =>
                    serviceProvider.GetRequiredService<IConnectionMultiplexer>());

            ServiceProvider provider = services.BuildServiceProvider();
            try
            {
                await provider
                    .GetRequiredService<IRequestExecutorResolver>()
                    .GetRequestExecutorAsync();
                return new RedisProvider(
                    provider,
                    provider.GetRequiredService<IConnectionMultiplexer>(),
                    provider.GetRequiredService<ITopicEventReceiver>(),
                    provider.GetRequiredService<ITopicEventSender>());
            }
            catch
            {
                await provider.DisposeAsync();
                throw;
            }
        }

        public async ValueTask DisposeAsync()
        {
            Connection.Close();
            await _serviceProvider.DisposeAsync();
        }
    }
}
