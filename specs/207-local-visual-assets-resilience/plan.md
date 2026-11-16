# Implementation Plan: Local Visual Asset Resilience

## Strategy

Eliminate runtime CDN dependencies using assets already present in the repository. Use a
system stack for Inter unless a local, licensed WOFF2 is already available. Import the
existing Font Awesome CSS through Vite so its relative webfont URLs are fingerprinted and
served locally.

## Steps

1. Inventory HTML/CSS external resources and all active icon classes.
2. Remove Google Fonts preconnect/stylesheet tags and duplicate CSS `@import`.
3. Set a system UI stack compatible with the current metrics, or declare reviewed local
   Inter files with `font-display: swap`.
4. Import the minimal local Font Awesome CSS entry from `src/assets/fonts` and verify icon
   compatibility against its version.
5. Replace unsupported classes or add accessible text fallbacks.
6. Change root `lang` to `es`, replace Vite favicon and normalize document title.
7. Validate dev/production asset paths, offline rendering and CV print fallback.

## Expected Files

- `FrontEnd/OneItb-FE/index.html`
- `FrontEnd/OneItb-FE/src/index.css`
- frontend entrypoint if local Font Awesome import is centralized there
- components containing unsupported icon classes, only when discovered
- OneITB favicon asset/configuration
- frontend tests and canonical runbook/evidence

## Risks And Controls

| Risk | Control |
|---|---|
| Local FA version lacks a newer icon | Inventory classes and map unsupported icons |
| CSS bundle becomes unnecessarily large | Import reviewed minimal entries where practical |
| Font metrics shift layout | Responsive regression with system stack before acceptance |
| Vite fails to copy webfonts | Build and inspect generated URLs/files |
| External Microsoft warnings are misattributed | Document source ownership; do not weaken policy |

## Coordination

Spec 207 should be implemented in the same frontend stabilization batch as Spec 206 so
layout thresholds are validated with final font metrics and branding.

