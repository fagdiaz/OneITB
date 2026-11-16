# Feature Specification: Adaptive Navigation and Brand Lockup

**Feature Directory**: `206-adaptive-navigation-brand-lockup`  
**Created**: 2026-08-04  
**Status**: Implemented `[I]`; responsive browser acceptance pending

## User Scenarios & Testing

### User Story 1 - Use all navigation space (Priority: P1)

As an authenticated user, I see every permitted module that fits in the header. Only the
items that do not fit move into a compact overflow menu, and all remain reachable.

**Why this priority**: A Student currently sees a hamburger despite having only three
modules and enough horizontal space, which hides important destinations unnecessarily.

**Independent Test**: Resize the same Student session from wide desktop to split-screen
and mobile and verify links move progressively without overlap, scrolling or lost state.

**Acceptance Scenarios**:

1. **Given** all permitted links fit, **When** the header renders, **Then** all are visible
   and no overflow menu is shown.
2. **Given** only some links fit, **When** width decreases, **Then** only lower-priority
   links move into one overflow menu.
3. **Given** a route or badge is active, **When** its link moves between regions, **Then**
   active state and badge remain correct.
4. **Given** width increases again, **When** links fit, **Then** they return directly
   without navigation or state loss.

---

### User Story 2 - See one consistent OneITB identity (Priority: P1)

As a visitor or authenticated user, I see the approved symbol aligned with a readable
`oneITB` wordmark in the header, Hero, identity section and footer. Dark mode does not use
an artificial bloom to rescue unreadable raster text.

**Why this priority**: Current full-logo assets lose contrast in dark mode and differ from
the compact identity already approved in the header.

**Independent Test**: Compare all four surfaces in both themes and across responsive
widths; symbol and text stay together, aligned and legible.

**Acceptance Scenarios**:

1. **Given** dark mode, **When** the brand lockup renders, **Then** its wordmark remains
   legible without a glow around the image.
2. **Given** any responsive width, **When** the layout changes, **Then** symbol and wordmark
   move and scale as one unit.
3. **Given** a linked versus decorative brand instance, **When** assistive technology
   reads the page, **Then** the identity is named once without redundant announcements.

---

### User Story 3 - Navigate accessibly at every width (Priority: P2)

As a keyboard or reduced-motion user, I can open, traverse and close the overflow menu,
retain visible focus and activate every route without a pointer.

**Why this priority**: Progressive overflow is incomplete if it introduces inaccessible
controls or focus loss.

**Independent Test**: Perform keyboard-only navigation and reduced-motion checks at one
desktop, one split-screen and one mobile width.

**Acceptance Scenarios**:

1. **Given** an open overflow menu, **When** Escape or outside interaction occurs, **Then**
   it closes and focus is restored appropriately.
2. **Given** reduced motion, **When** layout changes, **Then** content remains usable with
   no required animation.

### Edge Cases

- Search expands or notifications change width while links are being measured.
- A role has more links than can fit even on medium desktop widths.
- Browser zoom or a long localized label changes text metrics.
- The header auto-hides while overflow is open.
- An image asset fails to load.

## Requirements

### Functional Requirements

- **FR-001**: The header MUST show the maximum permitted links that fit its available
  navigation region.
- **FR-002**: Only non-fitting links MUST move into one overflow control.
- **FR-003**: Search, notifications and user controls MUST remain usable and non-overlapping.
- **FR-004**: The layout MUST react to actual container changes, including resize and zoom.
- **FR-005**: Link priority and movement MUST be deterministic and visually stable.
- **FR-006**: Direct and overflow links MUST share route, active-state and badge semantics.
- **FR-007**: The overflow control MUST support keyboard, focus restoration, Escape,
  outside interaction and route-change closing.
- **FR-008**: One reusable lockup MUST compose the approved symbol and `oneITB` wordmark.
- **FR-009**: The composed identity MUST replace dark-text full-logo usage in Header,
  Hero, identity section and footer where applicable.
- **FR-010**: Dark mode MUST remain legible without image bloom; light mode MUST preserve
  the approved visual balance.
- **FR-011**: Symbol and text MUST remain a single aligned, non-wrapping unit.

## Success Criteria

- **SC-001**: A Student at any tested width where three links fit sees all three directly.
- **SC-002**: The responsive matrix produces zero horizontal overflow or control overlap.
- **SC-003**: Every permitted route remains reachable with keyboard only at all tested
  widths.
- **SC-004**: Active route and unread badge values remain unchanged across 100% of link
  movements between direct and overflow regions.
- **SC-005**: All audited brand surfaces use one composed lockup and pass light/dark
  contrast review without bloom.

## Assumptions

- Existing destinations and role authorization do not change.
- Navigation priorities follow current product importance and are documented in the plan.
- Final width acceptance uses the typography produced by Spec 207.
