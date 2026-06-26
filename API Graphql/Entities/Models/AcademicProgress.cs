using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class AcademicProgress : EntityModel<Guid>
    {
        public Guid UserId { get; set; }
        public int SubjectId { get; set; }
        public Guid AssignedById { get; set; }
        public decimal? Score { get; set; }
        public AcademicProgressStatus Status { get; set; } = AcademicProgressStatus.InProgress;
        public string? Notes { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual User User { get; set; } = default!;
        public virtual Subject Subject { get; set; } = default!;
        public virtual User AssignedBy { get; set; } = default!;
    }
}
