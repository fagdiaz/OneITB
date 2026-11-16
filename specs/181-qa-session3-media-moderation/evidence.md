# Evidence: Spec 181

## Pre-implementation audit

- Corrected requested number from Spec 179 to Spec 181 because 179 and 180 already exist.
- Rejected global framing relaxation: `SAMEORIGIN` does not permit the Vite origin and would weaken clickjacking protection.
- Reused existing `SocialAttachment`, grouped notifications, chat unread queries, moderation audit, and upload cleanup rather than creating parallel systems.
- Confirmed current defects: moderators could edit/toggle other users' text; backend allowed replies to replies; PDF modal framed the backend URL directly; notification preferences were embedded in the bell.
- Confirmed already-satisfied requirements: self-like/self-comment notifications are already suppressed, widget unread badge exists, mobile menu content has unread count, YouTube uses click-to-load, and no first-party `mozPressure`/`mozInputSource` reference was found outside vendored assets.

## Speckit analyze

- Requirements: 17 functional requirements and 6 measurable success criteria.
- Tasks: 30 implementation/validation tasks, all mapped to a user story or closeout gate.
- Constitution conflicts: none after replacing permanent deletion and global X-Frame relaxation with soft state and object-URL preview.
- Remediation applied before QA: attachment replacement tests and cancellation/error mapping made explicit in T005, T007, and T010.

## QA gate

- Risk: HIGH (authorization, EF model/migration, uploads, background processing, GraphQL, Apollo/UI state).
- Checklist: 16/16 complete.
- `git diff --check`: PASS.
- Backend Release build: PASS, 0 warnings, 0 errors.
- Frontend Vite build: PASS.
- EF pending model changes: PASS, no drift before implementation.

## Implementation evidence

### Persistence and authorization

- Added `Inquiry.PreferAttachmentCover`, `Inquiry.IsHiddenByModerator`, and `Comment.IsHiddenByModerator` with false defaults, filtered indexes, and global visibility filters.
- Generated and reviewed `20260712201024_AddMediaModerationState`; it contains only three additive `bit` columns and two indexes. No FK or cascade behavior changed.
- Applied the migration to the healthy Docker SQL Server with `dotnet ef database update`; EF reported no pending model changes afterward.
- Social service tests prove that moderators cannot edit another author's text, third-level replies are rejected, and attachment replacement preserves the requested cover.
- Moderation service tests prove role enforcement, idempotent hide, one atomic audit record, and global-filter exclusion.

### Media and frontend state

- Cover selection is persisted and rendered as one primary medium plus compact secondary media; YouTube and attachments remain available together.
- Image lightbox navigation is scoped to the current publication and supports buttons, keyboard arrows, Escape, focus restoration, and position labels.
- PDF files are fetched from the authenticated application context, rendered through a temporary Blob URL, and aborted/revoked on close. Global `X-Frame-Options: DENY` remains unchanged.
- Publication/comment editing can retain, remove, or add attachment descriptors; the backend applies non-null replacement lists atomically.
- Long text uses a reusable line-clamped expansion control. Reaction action/count share one visual control while owner/moderator count access remains distinct.
- Existing messaging-contact data feeds both desktop and mobile unread badges; `Nav.test.jsx` verifies the aggregate mobile badge without a second query.

### Notifications and runtime resilience

- Added a bounded `UnreadMessageReminderHostedService`: configurable delay/threshold/interval, maximum 500 recipients per cycle, cancellation-aware EF query, and retry-on-next-cycle logging.
- Reminder persistence uses one stable group key per user, respects `PrivateMessage` preferences, republishes only when a newer unread message exists, and retries unique/concurrency collisions caused by horizontally scaled workers.
- Notification settings moved from the bell into an accessible switch dialog with optimistic feedback and rollback on mutation failure.
- Development Data Protection now uses an isolated application/key-ring directory without loading stale machine-DPAPI keys; production key management was not changed.

## Final validation

| Gate | Result |
|---|---|
| `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore` | PASS, 0 warnings, 0 errors |
| `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore` | PASS, 55/55 |
| `dotnet ef migrations has-pending-model-changes ... --configuration Release --no-build` | PASS, no model drift |
| `npm.cmd run build` | PASS, 360 modules, 879 ms |
| `npm.cmd run test -- --run --configLoader runner` | PASS, 8 files / 18 tests after the focused Nav test |
| `git diff --check` | PASS; Windows LF/CRLF notices only |
| First-party source scan | PASS: no `mozPressure`, `mozInputSource`, `pdf.worker`, or `docBaseUrl` usage |
| Runtime `/health` on isolated HTTP port 5011 | PASS, HTTP 200 `Healthy` |
| Runtime GraphQL schema | PASS, HTTP 200; `addInquiry`, `editInquiry`, `editComment`, `moderateInquiryVisibility`, and `moderateCommentVisibility` present |

The first attempt to run backend build and tests concurrently caused a transient compiler lock on `obj/Release/GraphQL.dll`; rerunning the gates sequentially passed. This was a validation orchestration collision, not a source failure.

## Browser evidence and residual manual gate

- The local frontend opened at `/login` and rendered the institutional session-expired state without a current first-party crash.
- An authenticated session was not available for the temporary browser run, so cover selection, attachment replacement, gallery/PDF interaction, moderation reason flow, and notification preferences remain explicitly **unverified in the presentation browser**.
- No console output from third-party YouTube code was suppressed. The iframe remains click-to-load and uses current permissions; provider/browser warnings after explicit playback remain external observability, not an application defect.
