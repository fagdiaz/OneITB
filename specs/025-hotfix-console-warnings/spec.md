# Feature Specification: Hotfix Console Warnings (025)

**Feature Branch**: `025-hotfix-console-warnings`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Solucionar el error de Integridad de Subrecursos (SRI) de Font Awesome bloqueado en index.html y refactorizar las manipulaciones directas del DOM en el frontend utilizando useEffect para eliminar la advertencia de 'Layout Forced' (Reflow)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Resolve Subresource Integrity Blocking (Priority: P1)

The user should load the application and see all Font Awesome icons rendering correctly without any console network blockages due to integrity mismatches.

**Why this priority**: Core icon presentation and clean browser console logs.

**Independent Test**:
Load any page with icons and verify console does not contain network integrity blocking messages.

**Acceptance Scenarios**:
1. **Given** a user loads the app, **When** they inspect the browser console, **Then** no Font Awesome integrity mismatch errors are present.

---

### User Story 2 - Eliminate Forced Layout Reflow Warnings (Priority: P2)

Ensure the CV resume component calculates page counts smoothly without blocking the main thread or causing Forced Reflows.

**Why this priority**: Avoid UX jittering and performance degradation.

**Independent Test**:
Verify that the `scrollHeight` measurement is throttled via animation frames.

**Acceptance Scenarios**:
1. **Given** the CV preview is rendered, **When** layout calculations trigger, **Then** they are performed asynchronously inside `requestAnimationFrame` to avoid UI blocking.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Remove strict SHA-512 SRI attributes from index.html Font Awesome link tag.
- **FR-002**: Refactor `scrollHeight` reading in ResumePreview component to utilize `requestAnimationFrame`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clean browser network request for Font Awesome.
- **SC-002**: Production build compiles with zero issues.
