# Implementation Plan: Fix Profile GraphQL 400 (027)

**Branch**: `027-fix-profile-graphql-400` | **Date**: 2026-06-09 | **Spec**: [spec.md](file:///F:/React/OneITB23/specs/027-fix-profile-graphql-400/spec.md)

**Input**: Feature specification from `/specs/027-fix-profile-graphql-400/spec.md`

## Summary
Align GraphQL query field definitions with the schema specified by HotChocolate inside Startup.cs on the backend, bypassing syntax parsing constraints.

## Technical Context
- **Language/Version**: React 18, Vite
- **Testing**: Production compilation check
- **Target Platform**: Web browser

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Decoupled GraphQL Architecture: Verified.
- Secure token validation: Verified.
- Development flow: Verified.

## Project Structure
### Documentation (this feature)
```text
specs/027-fix-profile-graphql-400/
├── spec.md              # Feature specification
├── plan.md              # This plan file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

## Implementation Strategy
1. **Query alignment**: Modify `getUserProfile.js` to correctly query `users` with matching `alias` and nested fields, removing invalid parameters.
2. **Build Validation**: Compile the project with `npm run build` to verify correctness.
