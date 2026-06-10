# Feature Specification: Literal CV Transplant to /profile (035)

**Feature Branch**: `035-literal-cv-transplant`

**Created**: 2026-06-10

**Status**: Ready

**Input**: User description: "Realizar un trasplante exacto y literal de los componentes y el layout original del proyecto de CV (_temp_cv_reference) hacia la ruta /profile de OneITB. El objetivo es eliminar cualquier superposición (overlapping) causada por layouts inventados en ciclos anteriores y asegurar que los campos visuales y la estética sean 100% idénticos a la versión original de referencia."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Profile page renders the exact original CV editor split layout (Priority: P1)

An authenticated user visiting `/profile` sees the identical two-panel split screen from the reference `_temp_cv_reference` app: a scrollable editor panel on the left and a live A4 preview on the right, with no overlapping elements.

**Why this priority**: This is the core deliverable. Without the correct layout the CV feature is unusable.

**Independent Test**: Navigate to `/profile` and verify left editor panel scrolls independently while right A4 preview is also independently scrollable, with no overlapping.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they visit `/profile`, **Then** the page renders a `grid grid-cols-1 lg:grid-cols-2` split with editor on the left and ResumePreview on the right — identical to the reference app layout.
2. **Given** a logged-in user, **When** they interact with any editor form (PersonalForm, ExperienceForm, etc.), **Then** the ResumePreview on the right updates reactively with zero overlapping UI artifacts.

---

### User Story 2 - Mock data matches the exact initialData structure from the reference (Priority: P2)

All editor forms and the ResumePreview receive data using the exact field names defined in the reference `initialData.ts` (`summary`, `personalInfo.linkedin`, `personalInfo.location`, etc.), not invented field mappings.

**Why this priority**: Incorrect field names cause empty sections in the CV preview, breaking the visual output.

**Acceptance Scenarios**:

1. **Given** the profile page loads, **When** the ResumePreview renders, **Then** name, title, experience, education, projects, skills, and languages are all populated from the `initialData` mock.

---

### Edge Cases

- What if `useReactToPrint` is not installed? Use a simple `window.print()` fallback or remove the print button — do not block the transplant.
- What if PrivateLayout's `<main>` clips the height of UserProfile? Remove `overflow-y-auto` from PrivateLayout's main wrapper so UserProfile controls its own scroll.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `UserProfile.jsx` MUST use the exact root container from the reference: `<div className="min-h-screen bg-slate-50 flex flex-col font-sans">`.
- **FR-002**: The split workspace MUST use `<main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[calc(100vh-64px)] lg:h-[calc(100vh-56px)]">`.
- **FR-003**: The left editor section MUST use `<section className="no-print p-4 md:p-6 overflow-y-auto custom-scrollbar space-y-6">` containing all five form components.
- **FR-004**: The right preview section MUST use `<section className="bg-slate-200/50 border-t lg:border-t-0 lg:border-l border-slate-200 overflow-y-auto">` containing `<ResumePreview>`.
- **FR-005**: `cvData` state MUST be initialized with the exact `initialData` object from `_temp_cv_reference/data/initialData.ts`.
- **FR-006**: All five editor forms MUST be included: `PersonalForm`, `ExperienceForm`, `EducationForm`, `ProjectsForm`, `SkillsLanguagesForm`.
- **FR-007**: `PrivateLayout.jsx` main area MUST NOT clip or scroll-contain the UserProfile component — the `overflow-y-auto` on PrivateLayout's `<main>` must be removed or changed to `overflow-hidden` so UserProfile manages its own scroll.
- **FR-008**: No C# backend or GraphQL files may be modified.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `/profile` renders with zero visual overlapping on a 1440px wide viewport.
- **SC-002**: Both the editor and preview panels scroll independently without interfering with each other.
- **SC-003**: All CV sections (Personal, Experience, Education, Projects, Skills, Languages) are populated from mock data on first render.
- **SC-004**: `npm run build` completes with zero errors after the transplant.

## Assumptions

- `useReactToPrint` may not be installed in OneITB — a `window.print()` fallback will be used if the package is absent.
- The `initialData.ts` structure is the canonical mock — no data from GraphQL is used on the profile CV workspace.
- PrivateLayout's `<aside>` sidebar must remain visible on desktop but must not interfere with the CV workspace height.
