using System;

namespace OneItb.Entities.Models
{
    public class SectionGrade
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SectionId { get; set; }
        public Guid StudentId { get; set; }
        public Guid AssignedById { get; set; }
        public decimal? Score { get; set; }
        public AcademicProgressStatus Status { get; set; } = AcademicProgressStatus.InProgress;
        public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        public virtual CourseSection Section { get; set; } = default!;
        public virtual SectionEnrollment Enrollment { get; set; } = default!;
        public virtual User Student { get; set; } = default!;
        public virtual User AssignedBy { get; set; } = default!;
    }
}
