# Quickstart: Media Preview Stabilization

1. Start the app through the documented runbook when local SQL/HTTPS are available.
2. Open a feed item with a YouTube URL.
3. Confirm a thumbnail appears before clicking play.
4. Confirm no iframe exists before clicking play.
5. Click play and confirm the `youtube-nocookie.com` iframe loads.
6. Open a feed item with an uploaded image path under `/uploads`.
7. Confirm the image renders inline from the backend origin.

Build check:

```powershell
cd FrontEnd/OneItb-FE
npm.cmd run build
```
