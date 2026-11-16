# Quickstart: Student Enrollment Onboarding

## Automated Gate

1. Run focused backend enrollment tests.
2. Run focused onboarding/profile frontend tests.
3. Run full backend and frontend suites.
4. Run Release and Vite builds.
5. Run EF pending-model check; expect no migration unless the implementation plan is
   explicitly revised.

## Manual Acceptance

1. Reset or use a Student with zero careers.
2. Sign in through Microsoft and verify a continuous loading/onboarding handoff with no
   actionable Login form flash, followed by the onboarding radio group.
3. Select one career, open confirmation, cancel and verify no persistence.
4. Confirm the same career and verify arrival at `/feed` only after refetch.
5. Verify profile and academic modules show only that career.
6. Attempt a crafted two-ID mutation and verify a controlled rejection with no changes.
7. Sign out and sign in again; onboarding must not repeat.

## Evidence Rule

Record actual commands, test counts and browser observations. Do not mark the external
institutional provider as verified while manual mode is active.
