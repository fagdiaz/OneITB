using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class UserCvSkill : EntityModel<Guid>
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Level { get; set; }
        public bool IsHidden { get; set; }
        public int SortOrder { get; set; }

        public virtual User User { get; set; } = default!;
    }
}
