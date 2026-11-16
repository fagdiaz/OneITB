# Research: Theme Logo Asset Contract

## Decision 1 - Select one image in React

`effectiveTheme` is the authoritative rendered theme because onboarding can temporarily
override the persisted preference. Selecting one `src` from that value avoids depending
on operating-system media queries and avoids mounting duplicate images.

## Decision 2 - Header is a separate symbol-only contract

The header has a compact, explicitly approved identity. It must not consume the full
themed logo or reconstruct a wordmark. The link supplies the accessible name and the
symbol image is decorative.

## Decision 3 - Preserve, do not transform, the assets

The light asset is transparent and the dark asset includes its designed background.
No CSS filter or glow is applied. A centered overflow viewport controls layout without
changing pixels or stretching either image.

