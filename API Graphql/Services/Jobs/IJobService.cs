using OneItb.Entities.Models;

namespace Services.Jobs
{
    public interface IJobService
    {
        IQueryable<JobOffer> GetJobOffers(bool onlyActive);

        Task<JobOffer> CreateJobOfferAsync(
            Guid employerId,
            string? employerRole,
            string title,
            string company,
            string description,
            string location,
            CancellationToken cancellationToken = default);

        Task<Guid[]> GetJobNotificationRecipientIdsAsync(
            Guid excludedUserId,
            CancellationToken cancellationToken = default);
    }
}
