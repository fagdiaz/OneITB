using System;
using System.Collections.Generic;

namespace OneItb.Entities.Models
{
    public class CourseSection
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int SubjectId { get; set; }
        public string Term { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public virtual Subject Subject { get; set; } = default!;
        public virtual ICollection<SectionInstructor> Instructors { get; set; } = new List<SectionInstructor>();
        public virtual ICollection<SectionEnrollment> Enrollments { get; set; } = new List<SectionEnrollment>();
        public virtual ICollection<SectionGrade> Grades { get; set; } = new List<SectionGrade>();
    }
}
