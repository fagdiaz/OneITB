# Quickstart: Social Polish Quick Wins

## Validation Scenarios

1. From `FrontEnd/OneItb-FE`, run component tests:

```powershell
npm.cmd run test -- --run --configLoader runner
```

2. From `FrontEnd/OneItb-FE`, run the production build:

```powershell
npm.cmd run build
```

3. Manual/browser check when local app is available:

- Open `/feed` authenticated.
- Open a post menu and use `Copiar enlace`; verify success feedback and copied URL ending in `/feed?inquiryId=...`.
- Drag multiple valid files into the attachment picker and verify preview/removal.
- Open an image/video/PDF modal and close it via Escape, outside click and close button.
