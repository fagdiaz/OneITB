using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class UserCvEducation : EntityModel<Guid>
    {
        public Guid UserId { get; set; }
        public string Institution { get; set; } = string.Empty;
        public string Degree { get; set; } = string.Empty;
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
        public bool IsHidden { get; set; }
        public int SortOrder { get; set; }

        public virtual User User { get; set; } = default!;
    }
}
