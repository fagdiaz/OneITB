# Evidence: Final Operational Acceptance

## Planning Baseline

- Branch: `codex/194-final-operational-acceptance`.
- SQL Server Docker: healthy.
- Backend/Vite processes before execution: none detected.
- Cross-artifact analysis: 16/16 functional requirements mapped to executable tasks; no critical or high planning gaps.
- Risk-based Speckit QA: `PASS` at HIGH risk.
- `git diff --check`: PASS.
- Backend Release build: PASS, 0 warnings and 0 errors.
- Frontend production build: PASS, 380 modules, 0 errors, 781 ms in the final safe gate.
- Local configuration key presence: SQL connection string and demo seed password available through user-secrets; values were not printed.
- External provider key presence: SMTP, Redis and Cloudinary production settings are absent from the inspected local environment.
- Existing uncommitted documentation normalization was preserved.
- `prompt_modulo1.txt` remains an unrelated local file and is excluded.

## Automated Baseline

- Backend suite: 147/147 PASS in Release.
- Frontend suite: 31 files and 79/79 tests PASS.
- Backend Release build: PASS, 0 warnings and 0 errors.
- Vite production build: PASS, 380 modules and 0 errors.
- EF Core pending-model check: PASS, model matches the latest migration.
- Docker Compose parse: PASS.
- Cancellation regression: PASS through pre-cancelled write tests with no side effects.
- Default pre-defense command: PASS and finite with runtime disabled.
- Docker API health and package-registry access were unavailable in the final restricted terminal. Docker health had already been observed as healthy and the dependency audit had already completed with zero high/critical findings.

## Runtime Acceptance Already Executed

The following gates were executed before the final safe re-run. They were not repeated
after the explicit instruction to avoid launching a server for rate-limit validation:

| Gate | Result | Executed evidence |
|---|---|---|
| GraphQL readiness | PASS | Temporary host answered health and `{ __typename }`; process was later stopped |
| Demo-role authentication | PASS / BLOCKED | Administrator, Student, Professor, Graduate and Employer authenticated; no canonical Moderator identity exists in the seeder |
| Upload content inspection | PASS | Valid PDF accepted; executable renamed as PDF and truncated PDF rejected without retained fixture |
| Bounded social schema | PASS | Unbounded `inquiries` field absent |
| Feed pagination | PASS | Page limit, deterministic order, deduplication, next page and author filtering verified |
| Academic pagination | PASS | Limit/order/next page and unauthorized access verified |
| Administrative silence | PASS | Like and unlike rejected with zero reaction and notification delta; original state restored |
| Magic Link | PASS | Generic response, pickup delivery, SQL digest, single use, request/redemption thresholds and recovery verified |
| Sensitive-data scan | PASS | Generated runtime logs did not contain collected credentials |
| Fixture cleanup | PASS | Upload, pickup mail, rate-limit data and account state removed or restored |

## Browser Acceptance

- Landing page: rendered without application-owned console errors or warnings.
- Student: feed, academic hub, chat and profile rendered with the expected identity.
- Session isolation: Student logout followed by Administrator login showed the
  administrator identity and data; no previous-user header, messages or notification
  state remained visible.
- Administrator: dashboard opened with Users, Subjects, Publications, Comments,
  Moderation and Audit sections.
- Employer: `/empleos/mis-ofertas` rendered two own offers and three applications.
- Professor: academic dashboard rendered the enrolled career and subjects.
- Graduate: `/empleos` rendered offers and application state.
- Moderator journey: BLOCKED because the canonical demo seeder does not provide a
  Moderator account. Authorization is covered by automated tests.
- Two-isolated-session realtime browser acceptance: BLOCKED because the available
  browser context did not provide an independent second authenticated storage context
  and Redis is not configured. Unit/integration coverage for WebSocket state remains
  green; no distributed-runtime pass is inferred.
- The browser acceptance tab was intentionally finalized after capture. This was not an
  application crash.

## Dependency and Navigation Hardening

- `react-router-dom` was updated from 6.10.0 to 6.30.4.
- The latest evaluated 7.x line was rejected during Code Freeze because it introduced
  high-severity advisories in the evaluated dependency graph.
- The retained 6.30.4 line has two moderate upstream advisories and zero high/critical
  findings. The SSR hydration advisory is not applicable to this Vite SPA.
- `getSafeInternalPath` now rejects external, protocol-relative, backslash and
  non-leading-slash notification destinations before they reach `<Link>`.
- Focused tests cover valid internal paths and all rejected redirect forms.

## External Provider Gates

| Provider | Result | Exact blocker |
|---|---|---|
| SMTP | BLOCKED | Real host/user/password/from settings are absent; Development pickup delivery passed |
| Redis | BLOCKED | `ConnectionStrings:Redis` is absent; in-memory fallback remains active |
| Cloudinary | BLOCKED | `CloudinarySettings:Url` is absent; local authenticated upload passed |

## Cleanup Verification

- Acceptance-owned PIDs `27272` and `14748` and their child trees were terminated.
- Ports 5094, 5095 and 5173 have no acceptance-owned listener.
- No `App_Data/Acceptance` fixture and no `oneitb-acceptance-*` upload remains.
- The final `-SkipRuntime`/default-safe execution left no process or fixture behind.

## Final Speckit Analysis

- Required artifacts: present (`spec.md`, `plan.md`, `tasks.md`).
- Functional requirements: 16/16 mapped to tasks and evidence.
- Constitution conflicts: 0.
- Critical/high consistency findings: 0.
- Unmapped implementation tasks: 0.
- Blocked tasks: T028, T033, T034 and T035, each with an exact environmental
  dependency and no false verification.
- Default validation behavior and runbook are consistent: runtime is opt-in.

## Status

Locally controllable critical/high gates are closed with executed evidence. The only
remaining acceptance items are external-provider smokes, a Moderator demo identity and
distributed/two-session realtime validation. They remain explicitly blocked rather than
being presented as verified.
