using OneItb.Entities.Models;

namespace Services.Jobs
{
    public interface IJobService
    {
        IQueryable<JobOffer> GetJobOffers(bool onlyActive, Guid? currentUserId);

        IQueryable<JobOffer> GetMyJobOffers(Guid employerId, string? employerRole);

        Task<JobOffer> CreateJobOfferAsync(
            Guid employerId,
            string? employerRole,
            string title,
            string company,
            string description,
            string location,
            CancellationToken cancellationToken = default);

        Task<JobApplication> ApplyToJobAsync(
            Guid applicantId,
            string? applicantRole,
            Guid jobOfferId,
            CancellationToken cancellationToken = default);

        Task<JobApplication> UpdateApplicationStatusAsync(
            Guid actorId,
            string? actorRole,
            Guid applicationId,
            JobApplicationStatus status,
            CancellationToken cancellationToken = default);

        Task<Guid[]> GetJobNotificationRecipientIdsAsync(
            Guid excludedUserId,
            CancellationToken cancellationToken = default);
    }
}
