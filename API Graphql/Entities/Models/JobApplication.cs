using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class JobApplication : EntityModel<Guid>
    {
        public Guid JobOfferId { get; set; }
        public Guid ApplicantId { get; set; }
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
        public JobApplicationStatus Status { get; set; } = JobApplicationStatus.Pending;

        public virtual JobOffer JobOffer { get; set; } = default!;
        public virtual User Applicant { get; set; } = default!;
    }
}
