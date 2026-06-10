# Feature Specification: Global Tailwind Refactor — Social Layer (037)

**Feature Branch**: `037-global-tailwind-refactor`
**Created**: 2026-06-10

## Problem Statement
After the 036 CSS purge, components that depended on BEM legacy classes lost all visual formatting. 
Specifically:
- `Nav.jsx`: All classes are BEM (`navbar__container-lists`, `list-end__img`, `menu-list__link`) + inline styles with `fontSize: '1.4rem'` — causes avatar to render at full size.
- `Feed.jsx`: 100% BEM (`content__header`, `posts__post`, `post__user-image`) — unstyled cards, giant avatar image.
- `Header.jsx`: Already clean (Tailwind, 034). ✅
- `SideBar.jsx`: Already clean (Tailwind, 034). ✅

## User Stories

### US1 — Nav dropdown and avatar render correctly (P1)
Avatar in header is `w-9 h-9 rounded-full object-cover`, dropdown uses Tailwind absolute positioning.

### US2 — Feed renders as styled post cards (P1)
Each post is a `bg-white rounded-xl shadow-sm p-4` card. Avatar is `w-10 h-10 rounded-full object-cover`.

## Files Affected
- `Nav.jsx` — full Tailwind rewrite
- `Feed.jsx` — full Tailwind rewrite
- `UserProfile.tsx` — DO NOT TOUCH

## Success Criteria
- SC-001: No BEM class names remain in Nav.jsx or Feed.jsx
- SC-002: `npm run build` → 0 errors
