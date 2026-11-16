# Feature Specification: Premium Branding and Landing

**Feature Branch**: `183-premium-branding-landing`

**Created**: 2026-07-12

**Status**: Implemented

**Input**: Consolidate the temporary visual logo laboratory into the definitive OneITB landing page, adopt the approved assets in the application header, and provide refined light/dark presentation with accessible, efficient motion.

## User Scenarios & Testing

### User Story 1 - Recognizable institutional identity (Priority: P1)

A visitor immediately recognizes OneITB from a consistent symbol in the header and a complete brand mark in the landing page without experimental labels or competing logo variants.

**Why this priority**: The landing page is the first institutional touchpoint and the current comparison laboratory is not suitable for a production demonstration.

**Independent Test**: Open the anonymous home page on desktop and mobile widths and verify that the header symbol, hero mark, calls to action, footer mark and navigation remain legible and correctly aligned.

**Acceptance Scenarios**:

1. **Given** the anonymous or authenticated header, **When** it renders, **Then** the approved transparent symbol replaces the text-only brand and remains a plain link to the home route.
2. **Given** the anonymous home page, **When** it renders, **Then** one coherent institutional landing replaces every temporary comparison scenario.
3. **Given** a missing or delayed decorative background asset, **When** the page loads, **Then** the primary brand, content and calls to action remain available.

---

### User Story 2 - Comfortable dual-theme presentation (Priority: P1)

A visitor can view the landing in the existing light or dark theme with softened surfaces, readable contrast and no pure black or white main backgrounds.

**Why this priority**: The final identity must preserve the existing Clean Tech / Tech Noir contract and remain comfortable during prolonged use.

**Independent Test**: Render the home page in both themes and verify main backgrounds, cards, typography, controls and images against the existing theme toggle.

**Acceptance Scenarios**:

1. **Given** light mode, **When** the landing renders, **Then** main surfaces use warm or slate-neutral tones with dark readable text.
2. **Given** dark mode, **When** the landing renders, **Then** main surfaces use softened deep tones, translucent elevated cards and light-gray text.
3. **Given** either theme, **When** keyboard focus reaches a call to action, **Then** the focus state is visible and does not depend on pointer hover.

---

### User Story 3 - Refined motion without accessibility or performance debt (Priority: P2)

A pointer user sees a subtle spotlight and reveal effects, while keyboard users and people requesting reduced motion receive the complete content without disruptive animation.

**Why this priority**: Motion should enhance hierarchy but must not create React render storms, memory leaks or accessibility barriers.

**Independent Test**: Move the pointer across the landing, scroll through sections, navigate by keyboard, and repeat with reduced-motion enabled.

**Acceptance Scenarios**:

1. **Given** a fine pointer, **When** it moves over the home page, **Then** a subtle theme-aware spotlight follows without blocking interaction.
2. **Given** a section entering the viewport, **When** motion is allowed, **Then** it reveals once and releases its observer.
3. **Given** reduced-motion preference or unavailable observer support, **When** the page loads, **Then** all content is immediately visible and usable.
4. **Given** navigation away from the page, **When** components unmount, **Then** animation frames and observers are cancelled.

### Edge Cases

- The browser lacks IntersectionObserver: all content remains visible.
- The device has a coarse pointer or requests reduced motion: spotlight and reveal motion are disabled.
- The landing is opened at a narrow mobile width: no horizontal overflow, clipped logo, or inaccessible call to action appears.
- A high-resolution background image is still loading: above-the-fold content does not depend on it and the asset is lazy-loaded.
- The user switches themes while the page is open: colors update through the existing root `dark` class without remounting the page.

## Requirements

### Functional Requirements

- **FR-001**: The approved transparent symbol MUST replace the static text brand in the real application header.
- **FR-002**: The header brand MUST remain a static, accessible home link without active glow or focus-dependent route state.
- **FR-003**: Final brand assets MUST use canonical, space-free paths under the frontend asset directory.
- **FR-004**: The anonymous home MUST contain one production landing and MUST NOT expose comparison-laboratory copy or obsolete logo variants.
- **FR-005**: The landing MUST provide a hero, product-value summary, role-oriented benefits, institutional call to action and footer identity.
- **FR-006**: The full transparent mark MUST be used where the brand name is needed; the transparent symbol MUST be used in compact contexts.
- **FR-007**: Background-bearing variants MUST only be loaded when they solve a demonstrated contrast need; otherwise equivalent CSS surfaces and the optimized transparent marks MUST be preferred.
- **FR-008**: Main light and dark backgrounds MUST avoid pure white and pure black while preserving readable contrast.
- **FR-009**: The landing spotlight MUST update CSS properties outside React state and MUST be rate-limited to the browser animation frame.
- **FR-010**: The spotlight MUST use pointer-safe overlays that never intercept navigation or controls.
- **FR-011**: Scroll reveals MUST use bounded observation and MUST clean up after reveal or unmount.
- **FR-012**: Motion MUST respect `prefers-reduced-motion` and content MUST never depend on animation to become usable.
- **FR-013**: Calls to action MUST expose visible hover and keyboard-focus feedback with stable accessible labels.
- **FR-014**: Images MUST include meaningful alternative text or be explicitly decorative, and below-fold images MUST be lazy-loaded with asynchronous decoding.
- **FR-015**: The implementation MUST add no animation library or other runtime dependency.
- **FR-016**: Existing authenticated navigation, search, notification and theme behavior MUST remain unchanged.
- **FR-017**: The affected frontend build and focused component tests MUST pass before documentation reports implementation.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The anonymous home contains zero visible references to a laboratory, comparison scenario or draft identity.
- **SC-002**: The header and landing render without horizontal overflow at 320 px, 768 px and desktop layouts.
- **SC-003**: Pointer movement causes zero React state updates and at most one pending animation-frame callback.
- **SC-004**: With reduced motion enabled, 100% of landing content is visible immediately and no reveal animation is required for navigation.
- **SC-005**: Every interactive landing control is reachable by keyboard and has a visible focus indicator.
- **SC-006**: Production build completes without errors and the new implementation adds zero package dependencies.

## Assumptions

- The existing ThemeContext remains the canonical light/dark state owner.
- The supplied transparent PNG files are the approved production marks; background variants are secondary presentation assets.
- The authenticated root redirect to the feed remains unchanged.
- Visual sign-off in the presentation browser remains a manual evidence gate after automated validation.
