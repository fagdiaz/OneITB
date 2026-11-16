# Research: Candidate Freeze and Pre-Defense Gate

## Decision 1: Evidence belongs to one immutable candidate identity

**Decision**: All final automated and manual results must identify the same commit SHA.
Worktree-only results are useful preflight evidence but cannot close CF-06.

**Rationale**: A successful result becomes stale as soon as candidate content changes.
Combining counts from successive cuts would overstate confidence.

**Rejected alternative**: Treat the newest result for each layer as cumulative release
evidence. Rejected because those layers may not have exercised the same source.

## Decision 2: Separate automated, manual, and external gates

**Decision**: Maintain three independent classifications:

1. automated/local gate;
2. manual browser and two-session gate;
3. external production-provider acceptance.

**Rationale**: The academic defense can be controlled locally while real cloud providers
remain unconfigured. Neither local automation nor external configuration proves browser
UX and role behavior.

## Decision 3: Candidate hygiene is a blocking gate

**Decision**: Every modified/untracked path must be classified. Secret-shaped tracked
content, generated logs, temporary audits, uploads, and unexplained binaries block freeze.

**Rationale**: A buildable but ambiguous repository cannot be reproduced or audited.

## Decision 4: Preserve the current demo database

**Decision**: Use read-only integrity checks and existing guarded validation scripts.
Do not run the reset script in this spec without a separate backup and explicit approval.

**Rationale**: The current data set is part of defense preparation and destructive seeding
could remove manual QA state or create last-minute drift.

## Decision 5: Finite automation only

**Decision**: Validation commands must terminate. Temporary APIs may only be started by
guarded scripts that use dedicated ports, capture process identity, and clean up in a
`finally` path.

**Rationale**: Blocking servers previously interrupted automation and can leave ambiguous
runtime state.

## Decision 6: Dependency advisories require classification

**Decision**: `npm audit --omit=dev` and package restore/build output are recorded. A
finding is classified by exploitability, affected runtime path, and availability of a
non-breaking remediation; it is never silently suppressed.

## Current Observations

- The active branch is not `main` or `master`, which is safe for feature work.
- The worktree contains numerous changes and untracked paths from Specs 212-217; it is not
  currently eligible for candidate freeze.
- Existing finite scripts cover static gates, local Redis/Mailpit, demo database integrity,
  six canonical logins, and authenticated upload smoke.
- Manual six-role browser behavior and two isolated realtime sessions remain separate
  evidence requirements.
- Current authoritative automated baselines are backend 234 and frontend 252. The earlier
  251 count remains historical evidence for Spec 217 only.
