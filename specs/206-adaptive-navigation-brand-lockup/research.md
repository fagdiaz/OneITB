# Research: Adaptive Navigation and Brand Lockup

## Why breakpoints are insufficient

The current `lg:flex` rule assumes all authenticated roles have the same link count and
all surrounding controls have fixed widths. Search expansion, notifications, localized
labels and Admin-only destinations violate that assumption. Container-based progressive
overflow responds to the space that actually remains.

## Measurement approach

A `ResizeObserver` on the navigation region plus a stable item-width map is preferred.
The algorithm reserves the overflow control before selecting visible items and updates in
one animation frame. This avoids repeatedly hiding an item, gaining width, showing it and
oscillating.

## Brand lockup approach

The transparent symbol is approved and works in both themes. The raster full logo embeds
dark lettering that requires artificial bloom on dark surfaces. Rendering the wordmark as
text provides native contrast, responsive scaling and atomic alignment while preserving
the identity.

