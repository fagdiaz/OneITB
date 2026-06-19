using System.Collections.Generic;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Career : EntityModel<int>
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public virtual ICollection<UserCareer> UserCareers { get; set; } = new List<UserCareer>();
        public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    }
}
