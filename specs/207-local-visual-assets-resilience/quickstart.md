# Quickstart: Local Visual Asset Resilience

## Automated

1. Search source for `fonts.googleapis`, `fonts.gstatic`, `cdnjs.cloudflare` and remote
   font CSS.
2. Run the complete frontend suite and Vite build.
3. Inspect `dist` for fingerprinted local webfonts and absence of external font URLs.

## Browser

1. Disable cache, block external network or use offline mode after local app load.
2. Reload Login, feed, academic, jobs, profile and admin.
3. Verify typography, all high-value icons and no downloadable-font warnings.
4. Open Network and confirm zero Google/gstatic/cdnjs font requests.
5. Print-preview the CV and verify readable fallback typography.

Development-tool banners and Microsoft-owned page warnings are recorded separately and
are not acceptance failures for this spec.

