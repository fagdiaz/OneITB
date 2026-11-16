# Feature Specification: Local Visual Asset Resilience

**Feature Directory**: `207-local-visual-assets-resilience`  
**Created**: 2026-08-04  
**Status**: Implemented `[I]`; offline/browser/print acceptance pending

## User Scenarios & Testing

### User Story 1 - Present the application without external font access (Priority: P1)

As a presenter, I can run OneITB with external Internet access unavailable and still see
readable typography and every essential navigation icon.

**Why this priority**: The current application requests core visual assets from external
font services, producing warnings and creating an avoidable defense-day dependency.

**Independent Test**: Block external network access, reload all principal routes and
verify that text, controls and icons remain complete with no external font requests.

**Acceptance Scenarios**:

1. **Given** external font domains are unavailable, **When** OneITB loads, **Then** core
   typography and controls render from local/system resources.
2. **Given** the application is built for production, **When** generated assets load,
   **Then** every required local icon font resolves successfully.
3. **Given** an icon has no compatible local glyph, **When** the affected control renders,
   **Then** it uses an intentional compatible icon or visible accessible label.

---

### User Story 2 - Keep documents and accessibility readable (Priority: P2)

As a user or evaluator, I see correct Spanish document metadata, OneITB identity and
readable CV print output regardless of optional font availability.

**Why this priority**: Language metadata, favicon and print fallbacks are low-risk changes
that improve accessibility and presentation quality.

**Independent Test**: Inspect document metadata and print-preview the CV in normal and
offline conditions.

**Acceptance Scenarios**:

1. **Given** the root document, **When** metadata is inspected, **Then** language, title
   and favicon identify the Spanish OneITB application.
2. **Given** CV print preview, **When** custom assets are unavailable, **Then** all text
   remains readable and layout remains usable.

### Edge Cases

- A locally bundled icon version does not contain a class used by the current UI.
- A production asset receives a fingerprinted path different from Development.
- Browser cache retains an old CDN stylesheet.
- System fonts have wider metrics and affect responsive navigation thresholds.
- Decorative icons fail while their controls still require accessible names.

## Requirements

### Functional Requirements

- **FR-001**: Core typography and icons MUST work without third-party font services.
- **FR-002**: Duplicate font requests MUST be eliminated.
- **FR-003**: The final typography source MUST be local or supplied by the operating system.
- **FR-004**: Essential icon resources MUST be bundled with the application or replaced
  by repository-owned equivalents.
- **FR-005**: Every active icon MUST be checked for compatibility with the selected source.
- **FR-006**: Missing decorative assets MUST NOT remove the accessible name of a control.
- **FR-007**: Production asset paths MUST load successfully without fixed development URLs.
- **FR-008**: The root document MUST identify Spanish language and OneITB branding.
- **FR-009**: CV and print content MUST retain readable fallback typography.
- **FR-010**: Security policies MUST NOT be weakened to suppress warnings from external
  identity-provider pages.

## Success Criteria

- **SC-001**: A clean application load makes zero requests to Google Fonts, gstatic or
  cdnjs for core typography/icons.
- **SC-002**: Offline review of Login, feed, academic, jobs, profile and administration
  shows zero missing-glyph boxes on essential controls.
- **SC-003**: Every required bundled font asset loads successfully in the production build.
- **SC-004**: The root document reports Spanish language, OneITB title and OneITB favicon.
- **SC-005**: CV print preview remains readable and structurally intact.

## Assumptions

- Existing repository-owned visual assets may be reused after compatibility review.
- Adding another icon framework during Code Freeze is not required.
- Development-tool notices and Microsoft-owned warnings are not application defects.
- Final responsive acceptance is coordinated with Spec 206 because font metrics affect fit.
