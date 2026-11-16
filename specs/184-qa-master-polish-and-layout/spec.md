# Feature Specification: QA Master Polish and Layout

**Feature Branch**: `184-qa-master-polish-and-layout`

**Created**: 2026-07-12

**Status**: Ready

**Input**: Resolve the final visual QA findings across branding, responsive navigation, media layout, dark-mode contrast, notification preferences, identity-safe mentions and job-notification deep links.

## User Scenarios & Testing

### User Story 1 - Predictable navigation at every viewport (Priority: P1)

Visitors see direct authentication actions when desktop space permits, while authenticated users gain a header that yields screen space on downward scroll and returns through upward scroll, the top-edge reveal zone, keyboard focus or route changes.

**Independent Test**: Exercise anonymous and authenticated headers at mobile, tablet and desktop widths using pointer, keyboard and scrolling.

**Acceptance Scenarios**:

1. **Given** the brand logo already links home, **When** navigation renders, **Then** no duplicate Inicio action appears.
2. **Given** an anonymous desktop/tablet viewport with sufficient width, **When** the header renders, **Then** Iniciar sesión and Registrarse remain directly visible.
3. **Given** an authenticated user scrolling down, **When** the threshold is crossed, **Then** the header hides smoothly and returns on upward scroll, top-edge hover/focus or route change.
4. **Given** keyboard navigation inside the header, **When** an element receives focus, **Then** the header cannot remain hidden.

---

### User Story 2 - Complete, bounded multimedia presentation (Priority: P1)

People can publish without horizontal overflow and can understand a mixed-media post without losing its cover or YouTube item. Hidden items remain reachable through a clear overflow tile and gallery.

**Independent Test**: Render one to eight mixed media items in posts and comments, including a selected image cover and YouTube video, then open the gallery and carousel.

**Acceptance Scenarios**:

1. **Given** narrow publication controls, **When** the composer wraps, **Then** selects and Publicar remain inside their container.
2. **Given** a selected image cover, **When** the media grid renders, **Then** the entire cover remains visible without cropping.
3. **Given** YouTube plus multiple attachments, **When** visible slots are selected, **Then** both the cover and video are represented before lower-priority files.
4. **Given** hidden media, **When** the overflow tile is activated, **Then** the complete gallery opens with an accurate hidden count.
5. **Given** image carousel navigation, **When** arrows render over content, **Then** simple high-contrast glyphs do not obscure the image.

---

### User Story 3 - Readable themed surfaces and unified footer (Priority: P2)

Users experience a softer slate dark theme, a low-opacity institutional texture on public/private layouts, readable composer fields and a consistent footer that preserves private navigation content.

**Independent Test**: Compare Home, feed composer, private layout and footer in both themes and verify text contrast and background continuity.

---

### User Story 4 - Actionable social and employment notifications (Priority: P1)

An identity-backed mention links to the correct profile and notifies the intended person without self-notification. A job notification reaches and highlights its exact offer rather than only opening the job board.

**Independent Test**: Reply to another user, inspect the mention link/notification, create a job offer, follow its notification and verify exact card focus/highlight.

**Acceptance Scenarios**:

1. **Given** a directed reply validated by the server, **When** it renders, **Then** its mention links to the persisted target profile.
2. **Given** a user replying to themselves, **When** the comment saves, **Then** no mention notification is generated.
3. **Given** a new job notification, **When** selected, **Then** `/empleos` scrolls to, focuses and temporarily highlights the matching offer.
4. **Given** notification preferences are opened, **When** they render, **Then** a compact side drawer replaces the centered gray full-screen modal and remains dismissible by Escape/outside click.

### Edge Cases

- Header auto-hide is disabled for anonymous users, at page top, during keyboard focus and when reduced motion is requested.
- Coarse-pointer/mobile users recover the header by scrolling upward; they do not depend on hover.
- A job ID is missing, invalid, filtered or not present in the loaded page: the board remains usable and shows no focus loop.
- Unknown `@text` without a persisted user relation remains plain text instead of linking to the wrong profile.
- Media contains no YouTube item, only YouTube, a removed cover or fewer tiles than the grid capacity.
- The background texture fails to load: base theme colors remain complete and readable.

## Requirements

### Functional Requirements

- **FR-001**: DOM image priority attributes MUST use the React-compatible lowercase form required by the installed React version.
- **FR-002**: Duplicate Inicio links MUST be removed from desktop and mobile navigation.
- **FR-003**: Anonymous authentication actions MUST remain direct desktop/tablet controls from the medium breakpoint upward.
- **FR-004**: Header auto-hide MUST apply only to authenticated sessions and MUST use scroll direction plus a stable threshold.
- **FR-005**: Header recovery MUST support upward scroll, top-edge pointer entry, keyboard focus and route changes with listener cleanup.
- **FR-006**: Private footer styling MUST align with the final landing identity while retaining private links and institutional content.
- **FR-007**: Publication composer controls MUST use bounded widths and shrink rules that prevent horizontal overflow.
- **FR-008**: Primary image tiles MUST use containment and preserve the entire asset.
- **FR-009**: Visible mixed-media selection MUST preserve the persisted cover first and prioritize a YouTube item when present.
- **FR-010**: The desktop grid MUST allocate half its area to the primary item and distribute secondary items in bounded cells.
- **FR-011**: Overflow count MUST be accurate and open the full media gallery.
- **FR-012**: Carousel navigation MUST use unobstructed glyphs with strong shadows and accessible names.
- **FR-013**: Affected dark surfaces MUST move from near-black to slate-blue elevated tones and composer labels/placeholders MUST be readable.
- **FR-014**: `Background.png` MUST be integrated as a low-opacity, pointer-inert texture with theme base-color fallback.
- **FR-015**: Home spotlight radius/intensity MUST increase without adding React pointer-render churn or ignoring reduced motion.
- **FR-016**: Mention links MUST only be generated from persisted `ReplyToUserId` identity and MUST never infer a target from ambiguous display text.
- **FR-017**: Directed-mention notifications MUST exclude self-notifications and use the existing grouped notification service.
- **FR-018**: Notification preferences MUST render as a compact side drawer with Escape, outside-click, pending-save and focus behavior.
- **FR-019**: Job notification URLs MUST include the persisted offer ID and the job board MUST scroll, focus and temporarily highlight that exact card.
- **FR-020**: All event listeners, timers, animation frames and observers introduced by this feature MUST clean up deterministically.
- **FR-021**: No new animation or UI dependency MUST be added.
- **FR-022**: Frontend tests/build, backend tests/build and affected runtime contracts MUST be executed or explicitly blocked before completion.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Zero React warnings caused by brand image priority attributes.
- **SC-002**: Zero horizontal overflow from composer controls at 320 px through desktop layouts.
- **SC-003**: Cover and YouTube both appear in visible slots for every mixed collection containing both.
- **SC-004**: All 31 existing frontend tests plus new focused tests pass.
- **SC-005**: Header is recoverable through at least four independent mechanisms and never auto-hides for anonymous users.
- **SC-006**: Job deep links focus a matching card once without repeated scrolling.
- **SC-007**: Runtime dependency count is unchanged and production audit reports no known high-severity vulnerability.

## Assumptions

- Existing `Comment.ReplyToUserId` is the canonical mention identity; arbitrary free-text mention resolution is outside this stabilization scope.
- Existing grouped notification behavior and self-notification suppression remain authoritative.
- `Background.png` is an approved visual source despite its size; no destructive image transformation is performed.
- The private feed remains the authenticated home route even after removing the duplicate Inicio button.

