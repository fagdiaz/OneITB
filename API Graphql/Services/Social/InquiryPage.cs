using System.Collections.Generic;
using OneItb.Entities.Models;

namespace Services.Social
{
    public sealed class InquiryPage
    {
        public IReadOnlyList<Inquiry> Items { get; init; } = new List<Inquiry>();
        public bool HasNextPage { get; init; }
        public string NextCursor { get; init; } = string.Empty;
        public int TotalCount { get; init; }
    }
}
