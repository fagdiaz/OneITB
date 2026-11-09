using System;

namespace OneItb.Entities.Models
{
    public class RegularStudentCertificate
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid StandingId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string CareerName { get; set; } = string.Empty;
        public string Term { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        public DateTime ValidUntil { get; set; }

        public virtual EnrollmentStanding Standing { get; set; } = default!;
    }
}
