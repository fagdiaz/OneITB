namespace Services.Uploads
{
    public sealed class UploadCleanupOptions
    {
        public bool Enabled { get; set; } = true;
        public bool RunOnStartup { get; set; } = true;
        public int RetentionHours { get; set; } = 24;
        public int IntervalHours { get; set; } = 6;
    }
}
