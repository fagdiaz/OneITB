using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class AcademicResource : EntityModel<Guid>
    {
        public int SubjectId { get; set; }
        public Guid UploaderId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? FileUrl { get; set; }
        public string? ExternalUrl { get; set; }
        public string ResourceType { get; set; } = "File";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        public virtual Subject Subject { get; set; } = default!;
        public virtual User Uploader { get; set; } = default!;
    }
}
