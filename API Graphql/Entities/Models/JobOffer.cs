using System;
using System.Collections.Generic;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class JobOffer : EntityModel<Guid>
    {
        public string Title { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid EmployerId { get; set; }

        public virtual User Employer { get; set; } = default!;
        public virtual ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
    }
}
