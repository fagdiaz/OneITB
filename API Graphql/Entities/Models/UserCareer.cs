using System;

namespace OneItb.Entities.Models
{
    public class UserCareer
    {
        public Guid UserId { get; set; }
        public int CareerId { get; set; }

        public virtual User User { get; set; } = null!;
        public virtual Career Career { get; set; } = null!;
    }
}
