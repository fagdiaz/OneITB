using OneItb.Entities.Models;

namespace Services.Social
{
    public sealed class ReactionUserPage
    {
        public IReadOnlyList<User> Items { get; init; } = Array.Empty<User>();
        public bool HasNextPage { get; init; }
        public string NextCursor { get; init; } = string.Empty;
        public int TotalCount { get; init; }
    }
}
