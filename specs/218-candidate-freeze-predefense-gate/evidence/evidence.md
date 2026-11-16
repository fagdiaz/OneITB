# Evidence: Candidate Freeze and Pre-Defense Gate

## Postponed-defense reconciliation - 2026-08-08

- The defense planned for 2026-08-07 at 09:00 did not occur because final documentation,
  code refinement/closure, and coordinated manual audit were not completed in time.
- No new defense date, presented version, final tag, or frozen SHA is documented.
- Current Git identity remains branch `codex/199-ux-b2b-academic-onboarding`, HEAD
  `7a6036cbe6830dcb41590b46f88944fab3e76e60`, with a documentary-only dirty worktree.
- The 234/234 backend and 252/252 frontend result remains a valid Spec 218 worktree
  preflight, not an integral gate on the future clean candidate SHA.
- T022 is `NOT RUN`; T023 is open with only limited populated-loading/clean-console
  observations and no exhaustive visual/keyboard/theme/print matrix.
- `CF-03`, `CF-04`, `CF-05`, `CF-06`, T025, T026, and T030 remain open.
- The complete current path and Word/Agy classification is recorded in
  `candidate-manifest.md`. No file was deleted, no database/runtime gate was executed,
  and no Git mutation was performed during this reconciliation.
- Documentation validation: 26 Markdown files, 28 local links with zero missing targets,
  balanced fences, 23 standalone Mermaid sources with recognized static headers,
  `git diff --check` PASS, and descending Development Log order PASS. Mermaid compilation
  and DOCX/PDF visual render remain NOT RUN because no Mermaid CLI or LibreOffice/soffice
  is available; no product test/runtime evidence was refreshed.
- A separate deterministic v2.3 text draft was reconstructed from the canonical memory
  and `docs/academic/03-use-cases.md`, using v2.2 only as the retained institutional shell.
  Its SHA-256 is `b3ffe5036639fb71df16d4da8500bfa9a80baabe16668b4a739a59ac2a3143f2`;
  structural checks found one A4 section, 782 paragraphs, 38 tables with exact geometry,
  CU-01..CU-26 exactly once, TOC/PAGE fields, 13 ordered figure reservations, one
  additional unnumbered class-diagram requirement, and zero accessibility findings.
  A second build produced the same hash. The render attempt was blocked by missing
  `soffice`, so this remains `BORRADOR_TEXTO_ESTRUCTURAL`, not DF-05/T023/CF-06 evidence.
- `prompt_agy.txt` was preserved and excluded by the reviewed path-specific rule
  `/prompt_agy.txt`; no file was deleted. The current Git-visible inventory remains 38
  paths, now 12 modified and 26 untracked.

**Status:** IN PROGRESS  
**Candidate:** `UNFROZEN_WORKTREE`  
**Date:** 2026-08-05  
**Environment:** Windows local development/acceptance

## Evidence Rules

- Results in this file are preflight evidence until bound to one clean commit SHA.
- Secret values, JWTs, connection strings, and provider credentials are never recorded.
- `PASS`, `FAIL`, `BLOCKED`, and `NOT RUN` retain the meanings in the evidence contract.

## Initial State

- Active branch: `codex/199-ux-b2b-academic-onboarding`.
- Base HEAD before integration: `700c6c342d84b54e4687a306146ee09299fcc7fc`.
- Remotes: `origin` targets the user's `fagdiaz/OneITB`; `leandro` is the collaborator
  remote. No network mutation was performed.
- Tooling: .NET SDK 9.0.314 building `net8.0`; Node 22.13.0; npm 10.9.2; Docker
  29.5.3; Git 2.42.0.windows.2.
- Full candidate SHA: not available; worktree contains 88 Git paths (71 modified, one
  deleted, 16 untracked).
- Worktree classification: all 88 Git paths have an explicit disposition; the promotional
  infographic was moved out of the SPA and the obsolete logo draft is preserved locally
  under an explicit ignore rule. See `candidate-manifest.md`.
- Automated gate: executed as worktree preflight at 2026-08-05 04:06-04:07 -03:00.
- Manual six-role matrix: NOT RUN.
- Two-session realtime matrix: NOT RUN.
- Freeze predicate: FAIL because candidate content is not yet immutable.

## Gate Results

| Gate | Result | Evidence |
|---|---|---|
| Candidate path classification | PASS | All 88 Git paths classified; no unresolved asset residue |
| Secret/residue review | PASS | No high-confidence token/key pattern; configs contain placeholders/no embedded SQL credentials |
| Backend tests/build | PASS | 234/234; Release build 0 warnings, 0 errors |
| Frontend tests/build | PASS | Historical initial preflight: 58 files, 251/251; Vite 565 modules in 591 ms. Superseded by the later 252/252 regression run below |
| EF model drift | PASS | No changes since latest migration |
| Compose/static integrity | PASS | Compose parsed; `git diff --check` clean |
| Dependency audit | PASS with accepted risk | Registry reached: two moderate React Router 6.30.4 advisories; SSR path unused and redirect destinations sanitized/tested; only fix is breaking v7 migration tracked by RR-09 |
| Redis/Mailpit acceptance | PASS | Healthy containers; real integration 2/2; Student-to-Moderator isolation 14/14; full suites/builds/EF PASS; SQL fingerprint unchanged; cleanup PASS |
| Demo DB/roles/GraphQL/upload | PASS | Integrity violations 0; six role logins; identity, feed, academic, messaging, notifications, jobs, admin, moderation and upload PASS |
| Six-role browser matrix | NOT RUN | Pending |
| Two-session realtime matrix | NOT RUN | Pending |
| Cleanup | PASS | Static gate removed/restored owned fixtures; no local-infrastructure container was created |

## Deviations and Blockers

- The current worktree contains changes from multiple recent specs. This is a planned
  preflight state, not a release candidate.
- No Git mutation is authorized by activation of this spec.
- `CF-03` remains open only as a release-evidence gate: successful automated/local checks
  are not yet bound to a clean SHA; browser role regression and two-client network
  realtime remain incomplete.
- Real SMTP, Redis, Cloudinary, Entra and production acceptance remain separate provider
  gates and are not converted into local PASS results.

## Local Acceptance Details

### Redis and Mailpit

- Command: `scripts/validate-local-infrastructure.ps1`.
- Real Redis/SMTP integration: 2/2 PASS.
- Apollo session-isolation regression: 14/14 PASS.
- Historical infrastructure-stage repeat: backend 234/234 and frontend 251/251 PASS;
  superseded as the current frontend baseline by the later 252/252 hotfix regression.
- Builds, EF drift and whitespace: PASS.
- Existing SQL container fingerprint: unchanged.
- Acceptance containers and network: removed by the script.

### Demonstration database

- Command: `scripts/validate-demo-database.ps1`.
- Integrity violations: 0.
- Canonical logins: 6/6 roles.
- Identity isolation and eight domain smokes: PASS.
- Temporary backend and upload fixture: cleaned by the guarded script.

### Dependency audit

- `npm audit --omit=dev` reached the registry and reported two moderate advisories in
  React Router 6.30.4.
- `GHSA-337j-9hxr-rhxg` concerns SSR hydration; OneITB is a Vite SPA and does not use the
  affected SSR deserialization path.
- `GHSA-wrjc-x8rr-h8h6` concerns backslash open redirects. OneITB sanitizes externally
  influenced post-login/onboarding destinations and tests `'/\\attacker.example/path'`.
- npm proposes only a forced migration to React Router DOM 7.18.2. The breaking upgrade
  remains `RR-09` postdefense rather than being forced during Code Freeze.

## Post-Gate Integrity

- No backend or frontend production source changed after the successful local acceptance.
- Subsequent changes were limited to evidence/canonical documentation, `.gitignore`, and
  relocation of an unreferenced promotional image outside the SPA bundle.
- Therefore no automated product gate was invalidated in this iteration.
- Cleanup verification found no listeners on 5094, 5097, 16379, 11025, or 18025 and no
  `oneitb23-acceptance-*` container remained.

## Published Prior Technical Cut And Browser Follow-Up

- User-authorized prior candidate commit: `9d14ff4aee756f8b7c2b19a887863add6e35bbac`;
  it was not presented, tagged as final, or frozen as CF-06.
- User-authorized Apollo hotfix commit: `7a6036cbe6830dcb41590b46f88944fab3e76e60`.
- Remote: `origin/codex/199-ux-b2b-academic-onboarding` in the user's personal repository.
- Public plus six-role representative allow/deny matrix: PASS; see
  `manual-role-matrix.md`.
- Runtime defect found: Apollo authorization handling assumed `graphQLErrors` was always
  an array. The error payload is now normalized before `.some`, `.map`, expiration, and
  logging paths.
- Regression: focused 8/8, full frontend 252/252, Vite 565 modules in 716 ms.
- Runtime repeat: Empleador own offers PASS; logout and Estudiante replacement showed the
  new identity, no stale employer data, and zero console errors.
- Worktree after commit/push: clean.
- Not closed: T022 two isolated-session realtime, T023 exhaustive visual/keyboard/theme/
  print matrix, T025 and T030. The in-app browser exposed only one profile, so realtime
  was not converted into a false PASS.
