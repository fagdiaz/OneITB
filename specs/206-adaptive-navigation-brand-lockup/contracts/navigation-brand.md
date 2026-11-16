# Contract: Progressive Navigation and Brand Lockup

## Overflow Invariants

1. Filter items by authenticated role.
2. Sort by stable product priority.
3. Show the largest fitting prefix.
4. If any item is hidden, reserve and show exactly one overflow control.
5. Hidden items retain route, badge, accessible name and action semantics.
6. Search, notification and user controls are never moved by this algorithm.

## Brand Invariants

- The approved symbol asset is the only raster required by the lockup.
- The text is exactly `oneITB` and is rendered in the DOM.
- Symbol and text use one `inline-flex`, `items-center`, non-wrapping container.
- Dark mode uses theme-aware foreground colors without drop-shadow bloom.
- Decorative duplicates have empty alt text; linked primary identity has one accessible
  name at the link level.

