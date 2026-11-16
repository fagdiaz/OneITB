# Research: Presentation Runtime Baseline

## Decision: Treat console cleanliness as an ownership problem, not a blanket suppression problem

**Rationale**: The current error capture contains app startup messages, browser development recommendations, iframe warnings, privacy-browser messages, CORS messages, and minified third-party script warnings. A professional presentation requires fixing application-owned problems while documenting external behavior honestly.

**Alternatives considered**:

- Hide external logs in DevTools: rejected because it is local-only and not portable.
- Patch global console methods: rejected because it can hide real regressions.
- Remove all embeds: rejected unless runtime evidence proves embeds are the only remaining blocker.

## Decision: Keep spec 130 as a gate before media or realtime refactors

**Rationale**: The current tree already has pending spec 129 changes. Jumping into media or chat code before proving which warnings are application-owned risks broad, low-confidence edits.

**Alternatives considered**:

- One large cleanup spec: rejected because it would mix environment, CORS, media, realtime, and documentation.
- Separate code-first specs immediately: rejected because `errores.txt` must first be classified against the active bundle.

## Decision: Use current canonical project documents

**Rationale**: The local `speckit-plan` instructions mention old document names, but this repository now uses `scope-and-requirements.md` and `architecture-and-design.md`. Planning must follow the canonical document status.

**Alternatives considered**:

- Recreate obsolete document names: rejected because it would reintroduce documentation drift.
