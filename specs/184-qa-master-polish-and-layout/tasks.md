# Tasks: QA Master Polish and Layout

## Phase 1 - Baseline and quality gate

- [x] T001 Record branch, dirty baseline, asset size, prompt corrections and preflight in `evidence.md`
- [x] T002 Cross-check spec, plan, research, contracts and tasks against the constitution
- [x] T003 Run Speckit QA pre-implementation builds and record blockers

## Phase 2 - Header, footer and global theme

- [x] T004 [P] Add header responsive/auto-hide tests and footer contract tests
- [x] T005 Correct brand DOM priority attribute and remove duplicate Inicio actions
- [x] T006 Implement anonymous `md` auth controls plus authenticated accessible auto-hide/reveal with cleanup
- [x] T007 Unify private Footer visual identity while retaining private content
- [x] T008 Integrate the low-opacity global texture and soften affected dark surfaces/spotlight

## Phase 3 - Composer and media

- [x] T009 [P] Add media selection/layout/arrow regression tests
- [x] T010 Bound feed composer controls and improve dark title/placeholder readability
- [x] T011 Prioritize cover plus YouTube, implement half-primary responsive mosaic and accurate overflow
- [x] T012 Preserve full cover with object containment and replace opaque carousel controls with shadowed glyphs

## Phase 4 - Mentions and notifications

- [x] T013 [P] Add MentionText identity/link tests and backend self-notification coverage
- [x] T014 Expose/load `ReplyToUser` without N+1 and render identity-backed mention links
- [x] T015 Verify existing grouped backend mention notification excludes the author and remains thread-bound
- [x] T016 Convert notification preferences to compact accessible side drawer with lifecycle cleanup

## Phase 5 - Employment deep links

- [x] T017 [P] Add JobBoard target focus/highlight component tests
- [x] T018 Include offer IDs in backend job notification ActionUrls
- [x] T019 Implement one-shot JobBoard scroll/focus/highlight with unavailable-target fallback

## Phase 6 - Verification, documentation and delivery

- [x] T020 Run backend tests/build, frontend tests/build, npm audit, source scans and `git diff --check`
- [x] T021 Execute affected runtime GraphQL and browser smoke where available; record blockers honestly
- [x] T022 Update ROADMAP, DOCUMENTATION_STATUS, FINAL_AUDIT_REPORT and newest-first DEVELOPMENT_LOG
- [x] T023 Review tracked/untracked files, exclude operational trash and verify no secret enters the commit
- [x] T024 Commit the coherent product changes and push branch `184-qa-master-polish-and-layout`

## Definition Of Done

- [x] Every task and acceptance contract is satisfied or explicitly blocked.
- [x] No new package or EF migration is introduced by Spec 184.
- [x] Tests/builds pass and runtime checks are recorded.
- [x] Documentation remains evidence-based and newest-first.
- [x] The pushed commit contains product code/docs/assets only, without specs or local diagnostics.
