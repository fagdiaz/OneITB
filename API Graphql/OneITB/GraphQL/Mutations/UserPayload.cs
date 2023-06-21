using OneItb.Entities.Models;

namespace GraphQL.GraphQL.Mutations
{
    public record UserPayload(User user, string token);
}
