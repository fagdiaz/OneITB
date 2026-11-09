namespace OneItb.Entities.Models;

public sealed class JobApplicationCv
{
    public Guid ApplicationId { get; set; }
    public int SchemaVersion { get; set; }
    public DateTime CapturedAtUtc { get; set; }
    public string PayloadJson { get; set; } = string.Empty;
}
