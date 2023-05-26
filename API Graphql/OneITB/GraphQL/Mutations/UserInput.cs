namespace GraphQL.GraphQL.Mutations
{
    public record UserInput(string FullName, string Email, string Password, string Alias, string UserName, int AccountId);
}
