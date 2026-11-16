# Research: Premium Branding and Landing

## Decision 1: Native motion instead of Framer Motion

**Decision**: Use IntersectionObserver, requestAnimationFrame and Tailwind transitions.

**Rationale**: The requested animations are reveal-once and pointer spotlight effects. Native APIs cover both without adding bundle weight, dependency maintenance or animation lifecycle abstraction.

**Alternatives considered**: Framer Motion was rejected because no current dependency or interaction requires its orchestration features. React state on pointer movement was rejected because it would rerender the landing continuously.

## Decision 2: Canonical asset names

**Decision**: Normalize approved files to space-free names directly under `src/assets/` and expose them through a small brand component.

**Rationale**: Stable imports improve portability across Linux containers and reduce ambiguity between final and experimental logo variants.

**Alternatives considered**: Retaining filenames with spaces was rejected as needless friction. Renaming all historical draft assets was rejected because they are outside the final runtime scope and may be retained as design evidence.

## Decision 3: Transparent assets on the critical path

**Decision**: Use the compact transparent symbol in the header and the transparent full logo throughout runtime UI. Keep the approved background-bearing files canonical but exclude them from imports because custom CSS surfaces provide the required contrast.

**Rationale**: The supplied background images are several megabytes; they should not delay first meaningful content or navigation.

**Alternatives considered**: Loading the background image in the hero or below the fold was rejected because it still adds 4.47 MB to the deployment. Re-encoding source assets was deferred because visual asset transformation requires separate design approval.

## Decision 4: Accessible reveal behavior

**Decision**: A reusable reveal component immediately exposes content when reduced motion is requested or IntersectionObserver is unavailable; otherwise it observes once and disconnects.

**Rationale**: Animation cannot become a content availability dependency, and every observer requires deterministic cleanup.

## Decision 5: Theme integration

**Decision**: Reuse the existing root `dark` class and Tailwind variants. Main light surfaces use slate/stone neutrals; dark surfaces use softened slate values. Print-specific pure white/black rules remain untouched.

**Rationale**: ThemeContext is already the canonical preference owner and print requires a separate contrast contract.
