# Implementation Plan: Enterprise Jobs ATS Seeder QA

## Technical Context

- Backend: .NET 8, EF Core 8, HotChocolate 14, SQL Server.
- Frontend: React 18, Apollo Client 3.7, Vite 8, Tailwind v4.
- Existing Jobs baseline from Spec 175 is reused and upgraded to Spec 173 with Mini-ATS.
- Persistence must preserve AD-004: explicit FKs and `DeleteBehavior.Restrict`.
- Business operations remain GraphQL; no REST endpoints are added.

## Constitution Check

- Decoupled contracts: PASS, GraphQL only for jobs/ATS.
- Security/passwords: PASS, no secrets, role checks in backend.
- Input validation: PASS, bounded strings and status enum.
- Relational integrity: PASS, no cascade delete.
- Evidence completion: PASS, evidence.md will record commands and blockers.

## Design Decisions

- `JobApplication` is first-class EF entity with unique `(JobOfferId, ApplicantId)`.
- `JobApplicationStatus` is stored as string for readability and stable migrations.
- `JobService` owns authorization and ATS rules; resolvers remain thin.
- `JobOffer` graph loading includes Employer/Account and Applications/Applicant/Account with `AsSplitQuery` to avoid cartesian blowups.
- Frontend separates student board and employer ATS route to keep responsibilities clear.

## Artifacts

- `research.md`
- `data-model.md`
- `quickstart.md`
- `tasks.md`
- `evidence.md`
