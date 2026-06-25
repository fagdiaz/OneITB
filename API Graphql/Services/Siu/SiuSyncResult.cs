namespace Services.Siu
{
    public sealed record SiuSyncResult(
        int SubjectId,
        int Processed,
        int Created,
        int Updated,
        int Skipped,
        string Message,
        IReadOnlyList<string> SkippedItems);
}
