using System.Collections.Generic;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Career : EntityModel<int>
    {
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public virtual ICollection<UserCareer> UserCareers { get; set; } = new List<UserCareer>();
        public virtual ICollection<SubjectCareer> SubjectCareers { get; set; } = new List<SubjectCareer>();
    }
}
