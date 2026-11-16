# Implementation Plan: Total Frontend Refactor – Layout & Profile (034)

**Branch**: `034-total-frontend-refactor` | **Date**: 2026-06-10 | **Spec**: [spec.md](file:///F:/React/OneITB23/specs/034-total-frontend-refactor/spec.md)

**Input**: Feature specification from `/specs/034-total-frontend-refactor/spec.md`

## Summary
Eradicate legacy CSS grid classes (`.layout`, `.layout__content`, `.layout__aside`) that collide with Tailwind v4 CV components. Rewrite `PrivateLayout.jsx` and `SideBar.jsx` using Tailwind utilities only. Ensure `UserProfile.jsx` renders the two-column CV workspace correctly. Neutralize conflicting rules in `styles.css`. Validate with `npm run build`.

## Technical Context
- **Language/Version**: React 18, Vite 5, Tailwind CSS v4
- **Testing**: Production compilation check (`npm run build`)
- **Target Platform**: Web browser (desktop-first, responsive down to 320px)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Decoupled GraphQL Architecture: Verified — no backend/GraphQL changes.
- Secure token validation: Verified — AuthContext and auth guard logic untouched.
- Development flow: Verified — no git commits; changes to FrontEnd only.

## Project Structure
### Documentation (this feature)
```text
specs/034-total-frontend-refactor/
├── spec.md              # Feature specification
├── plan.md              # This plan file
└── tasks.md             # Phase 2 output
```

### Files to be Modified
```text
FrontEnd/OneItb-FE/src/
├── assets/css/styles.css               # Neutralize .layout grid rules
├── Components/layout/private/
│   ├── PrivateLayout.jsx               # Rewrite with Tailwind
│   └── SideBar.jsx                     # Rewrite with Tailwind
```

### Files Preserved (Read-Only)
```text
FrontEnd/OneItb-FE/src/
├── index.css                           # Already correct (Tailwind v4 + print CSS)
├── Components/profile/UserProfile.jsx  # Already uses Tailwind grid (verify only)
├── Components/resume/ResumePreview.tsx # No changes
├── Components/editor/*.tsx             # No changes
├── context/                            # No changes
├── router/Routing.jsx                  # No changes
```

## Implementation Strategy

### Phase 1 – CSS Surgery on `styles.css`
Neutralize the `.layout` grid by commenting out the `display: grid` and `grid-template-*` rules. The structural layout is delegated entirely to JSX and Tailwind. Non-layout rules (navbar colors, button styles, form styles) are preserved verbatim.

### Phase 2 – PrivateLayout Rewrite
Replace the `.layout` div wrapper with a Tailwind flex-column container (`flex flex-col min-h-screen`). Keep `<Header>` at the top. Replace `<section className="layout__content">` with `<main className="flex-1 overflow-y-auto">`. Move `<SideBar>` to be a fixed right panel or remove it from the main flow if it breaks the content column.

### Phase 3 – SideBar Rewrite
Replace all BEM class names with equivalent Tailwind utilities. Preserve avatar, name display, stats (Siguiendo/Seguidores/Publicaciones), and the quick-post form. Style as a compact card that sits below the header on mobile and as a right-rail on desktop if layout permits.

### Phase 4 – UserProfile Verification
Confirm `UserProfile.jsx` already implements the two-column grid correctly. If the legacy CSS was interfering with it, the fix in Phase 1 is sufficient. Verify the mock data flows to `ResumePreview`.

### Phase 5 – Build Validation
Run `npm run build` and confirm zero errors.
