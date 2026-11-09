using System;
using System.Collections.Generic;

namespace OneItb.Entities.Models
{
    public class EnrollmentStanding
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid StudentId { get; set; }
        public int CareerId { get; set; }
        public string Term { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string SourceReference { get; set; } = string.Empty;
        public string Status { get; set; } = "Regular";
        public DateTime ValidFromUtc { get; set; }
        public DateTime ValidUntilUtc { get; set; }
        public DateTime? RevokedAtUtc { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public virtual User Student { get; set; } = default!;
        public virtual Career Career { get; set; } = default!;
        public virtual ICollection<RegularStudentCertificate> Certificates { get; set; } = new List<RegularStudentCertificate>();
    }
}
