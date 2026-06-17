namespace OneItb.Entities.Models
{
    public class SubjectCareer
    {
        public int SubjectId { get; set; }
        public int CareerId { get; set; }

        public virtual Subject Subject { get; set; } = null!;
        public virtual Career Career { get; set; } = null!;
    }
}
