using System.Security.Claims;
using HotChocolate;
using HotChocolate.Execution;
using HotChocolate.Execution.Configuration;
using HotChocolate.Subscriptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using OneITB.Core.Services.Interfaces;
using OneITB.GraphQL.Mutations;
using OneITB.GraphQL.Subscriptions;
using OneItb.Entities.Models;
using Xunit;

namespace Services.Tests.Infrastructure;

public sealed class PrivateMessageTopicAdversarialTests
{
    public sealed class ProbeQuery
    {
        public string Health() => "ok";
    }

    private static IHttpContextAccessor Actor(string? claim)
    {
        var context = new DefaultHttpContext();
        if (claim != null)
        {
            context.User = new ClaimsPrincipal(new ClaimsIdentity(
                new[] { new Claim(ClaimTypes.NameIdentifier, claim) }, "fixture"));
        }
        return Mock.Of<IHttpContextAccessor>(accessor => accessor.HttpContext == context);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("invalid-guid")]
    public async Task InvalidIdentityCannotOpenATopic(string? claim)
    {
        var receiver = new Mock<ITopicEventReceiver>(MockBehavior.Strict);
        await Assert.ThrowsAsync<GraphQLException>(async () =>
        {
            await new Subscription().SubscribeToMessageReceived(receiver.Object, Actor(claim));
        });
        receiver.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ConcurrentSendsReachExactlyTheirParticipantTopics()
    {
        var services = new ServiceCollection();
        services.AddGraphQLServer().AddQueryType<ProbeQuery>().AddInMemorySubscriptions();
        await using var provider = services.BuildServiceProvider();
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
        await provider.GetRequiredService<IRequestExecutorResolver>()
            .GetRequestExecutorAsync(cancellationToken: timeout.Token);
        var receiver = provider.GetRequiredService<ITopicEventReceiver>();
        var publisher = provider.GetRequiredService<ITopicEventSender>();
        var a = Guid.NewGuid();
        var b = Guid.NewGuid();
        var c = Guid.NewGuid();
        var d = Guid.NewGuid();
        var resolver = new Subscription();
        await using var streamA = await resolver.SubscribeToMessageReceived(receiver, Actor(a.ToString()));
        await using var streamB = await resolver.SubscribeToMessageReceived(receiver, Actor(b.ToString()));
        await using var streamC = await resolver.SubscribeToMessageReceived(receiver, Actor(c.ToString()));
        await using var streamD = await resolver.SubscribeToMessageReceived(receiver, Actor(d.ToString()));

        // Every reader must see its marker, including the unrelated user D.
        // Collect every preceding ID so duplicate deliveries also fail the test.
        var marker = Guid.NewGuid();
        var received = new[] { streamA, streamB, streamC, streamD }
            .Select(stream => ReadThroughMarker(stream, marker, timeout.Token)).ToArray();
        var persistence = new Mock<IMessagingService>(MockBehavior.Strict);
        persistence.Setup(service => service.SendMessageAsync(
                a, It.IsAny<Guid>(), It.IsAny<string>(), timeout.Token))
            .Returns(async (Guid from, Guid to, string content, CancellationToken _) =>
            {
                await Task.Yield();
                return new Message { SenderId = from, ReceiverId = to, Content = content };
            });
        var mutation = new Mutation();
        var writes = Enumerable.Range(0, 24).Select(index =>
            mutation.SendMessage(index % 2 == 0 ? b : c, $"frame-{index}", persistence.Object,
                publisher, Actor(a.ToString()), NullLogger<Mutation>.Instance, timeout.Token));
        var sent = await Task.WhenAll(writes).WaitAsync(timeout.Token);
        Assert.Equal(24, sent.Select(message => message.Id).Distinct().Count());

        foreach (var id in new[] { a, b, c, d })
        {
            await publisher.SendAsync(PrivateMessageTopics.ForUser(id), new Message { Id = marker }, timeout.Token);
        }

        var batches = await Task.WhenAll(received).WaitAsync(timeout.Token);
        Assert.Equal(sent.Select(m => m.Id).Order().ToArray(), batches[0]);
        Assert.Equal(sent.Where(m => m.ReceiverId == b).Select(m => m.Id).Order().ToArray(), batches[1]);
        Assert.Equal(sent.Where(m => m.ReceiverId == c).Select(m => m.Id).Order().ToArray(), batches[2]);
        Assert.Empty(batches[3]);
    }

    private static async Task<Guid[]> ReadThroughMarker(ISourceStream<Message> stream,
        Guid marker, CancellationToken cancellationToken)
    {
        var ids = new List<Guid>();
        await foreach (var item in stream.ReadEventsAsync().WithCancellation(cancellationToken))
        {
            if (item.Id == marker) return ids.Order().ToArray();
            ids.Add(item.Id);
        }
        throw new InvalidOperationException("Stream ended before its marker.");
    }
}
