using System;
using System.Security.Claims;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Execution;
using HotChocolate.Subscriptions;
using HotChocolate.Types;
using Microsoft.AspNetCore.Http;
using OneItb.Entities.Models;

namespace OneITB.GraphQL.Subscriptions
{
    public static class PrivateMessageTopics
    {
        public static string ForUser(Guid userId) => $"private-message:{userId:N}";
    }

    public class Subscription
    {
        public async ValueTask<ISourceStream<Message>> SubscribeToMessageReceived(
            [Service] ITopicEventReceiver receiver,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            string value = httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(value, out Guid userId))
                throw new GraphQLException("No se pudo identificar al usuario autenticado.");

            return await receiver.SubscribeAsync<Message>(PrivateMessageTopics.ForUser(userId));
        }

        [Authorize]
        [Subscribe(With = nameof(SubscribeToMessageReceived))]
        public Message MessageReceived([EventMessage] Message message) => message;
    }
}
