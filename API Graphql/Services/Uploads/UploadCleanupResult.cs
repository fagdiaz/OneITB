namespace Services.Uploads
{
    public sealed record UploadCleanupResult(int ScannedFiles, int DeletedFiles, int PreservedFiles, int FailedFiles);
}
