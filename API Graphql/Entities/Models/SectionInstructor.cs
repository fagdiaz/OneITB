using System;

namespace OneItb.Entities.Models
{
    public class SectionInstructor
    {
        public Guid SectionId { get; set; }
        public Guid ProfessorId { get; set; }
        public DateTime AssignedAtUtc { get; set; } = DateTime.UtcNow;

        public virtual CourseSection Section { get; set; } = default!;
        public virtual User Professor { get; set; } = default!;
    }
}
