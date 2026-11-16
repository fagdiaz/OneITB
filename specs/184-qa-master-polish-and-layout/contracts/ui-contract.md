# UI Contract: Master Polish

## Header

- Anonymous: always visible, direct auth actions from `md`, hamburger below `md`.
- Authenticated: auto-hide after downward scroll; recover by upward scroll, top edge, focus or route change.
- Logo remains the sole home affordance.

## MentionText

- Receives text and zero or more persisted user identities.
- Links only matching known mention aliases to `/profile/{id}`.
- Emits unmatched content as React text, never raw HTML.

## MediaGrid

- Primary remains first and occupies half the desktop mosaic.
- YouTube is promoted into visible secondary capacity.
- Overflow opens the complete original item list.

## Job notification

- Action URL: `/empleos?jobOfferId={UUID}`.
- Matching card ID: `job-offer-{UUID}`.
- Target receives `tabIndex=-1`, scroll/focus once and temporary highlight.

