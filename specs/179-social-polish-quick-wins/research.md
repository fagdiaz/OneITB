# Research: Social Polish Quick Wins

## Decision: Use progressive clipboard support for post sharing

**Rationale**: `navigator.clipboard.writeText` is available in secure browser contexts and avoids hidden inputs or document selection hacks. A controlled error message is enough when the browser blocks access.

**Alternatives considered**: Native Web Share API was rejected because desktop support and permission behavior vary; it can be added later as a progressive enhancement without changing the route contract.

## Decision: Reuse existing attachment validation for drag-and-drop

**Rationale**: The upload picker already enforces count, aggregate size and deduplication. Drop handling should feed the same code path so manual and drag selection cannot drift.

**Alternatives considered**: Separate drop validation was rejected because it would duplicate limits and increase regression risk.

## Decision: Improve modals without adding a dialog library

**Rationale**: Current modals are small and already support Escape and click-outside. Adding focus restoration, stable labels and defensive rendering is enough for this quick-win scope.

**Alternatives considered**: Installing a modal/focus-trap dependency was rejected due code freeze discipline and unnecessary bundle impact.
