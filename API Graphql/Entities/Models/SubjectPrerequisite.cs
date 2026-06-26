namespace OneItb.Entities.Models
{
    public class SubjectPrerequisite
    {
        public int SubjectId { get; set; }
        public int PrerequisiteId { get; set; }

        public virtual Subject Subject { get; set; } = default!;
        public virtual Subject Prerequisite { get; set; } = default!;
    }
}
