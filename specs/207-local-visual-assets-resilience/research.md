# Research: Local Visual Asset Resilience

## Current duplication

`index.html` links Google Inter and `index.css` imports the same family again. The browser
can therefore report repeated failures. `index.html` also loads Font Awesome 6.6.0 from
cdnjs even though a Font Awesome web bundle exists under `src/assets/fonts`.

## Typography decision

No local Inter files were identified in the targeted inventory. Downloading fonts during
Code Freeze adds licensing and supply-chain work. A system stack such as `ui-sans-serif,
system-ui, -apple-system, "Segoe UI", sans-serif` is the safest default unless a reviewed
local Inter package is already present when implementation begins.

## Icon decision

The repository contains Font Awesome webfonts and CSS. Importing those files through Vite
removes the network dependency, but the local bundle version and active class inventory
must be reconciled. This is preferable to installing another icon library during freeze.

**Implemented decision**: Vite imports the repository-owned Font Awesome 6.1.2 bundle.
An automated source guard compares every active icon class with the bundled metadata;
unsupported aliases were replaced with compatible glyph names.

## Final typography decision

The application uses `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
"Segoe UI", sans-serif`. Print surfaces use explicit Arial/Segoe UI fallbacks. No font
was downloaded or added to the dependency graph.

## Console ownership

React/Apollo DevTools messages are informational development output. Microsoft CSP,
BSSO, cookie, Quirks and OneCollector CORS messages originate from Microsoft pages. This
spec addresses only requests controlled by OneITB.
