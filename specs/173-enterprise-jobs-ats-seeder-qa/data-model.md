# Data Model: Enterprise Jobs ATS Seeder QA

## JobOffer

Existing entity extended with:
- `Applications`: collection of `JobApplication`.

## JobApplication

Fields:
- `Id`: Guid.
- `JobOfferId`: Guid required.
- `ApplicantId`: Guid required.
- `AppliedAt`: DateTime UTC.
- `Status`: `JobApplicationStatus` required.

Relationships:
- `JobApplication.JobOfferId -> JobOffers.Id`: Restrict.
- `JobApplication.ApplicantId -> Users.Id`: Restrict.
- Unique index: `(JobOfferId, ApplicantId)`.

## JobApplicationStatus

Values:
- Pending.
- Reviewed.
- Rejected.
