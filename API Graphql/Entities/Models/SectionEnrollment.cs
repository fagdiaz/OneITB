using System;

namespace OneItb.Entities.Models
{
    public class SectionEnrollment
    {
        public Guid SectionId { get; set; }
        public Guid StudentId { get; set; }
        public DateTime EnrolledAtUtc { get; set; } = DateTime.UtcNow;

        public virtual CourseSection Section { get; set; } = default!;
        public virtual User Student { get; set; } = default!;
        public virtual SectionGrade? Grade { get; set; }
    }
}
