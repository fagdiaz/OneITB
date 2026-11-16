# Research Notes: Hotfix Console Warnings (025)

## Subresource Integrity Issues
Subresource Integrity (SRI) blockages happen when the asset served by the CDN server has a different cryptographic hash compared to the value specified in the `integrity` attribute. The safest and most robust fix is using a reliable path reference without the SRI hash checks if the CDN provider changes CDN distributions without notification.

## Forced Reflow Warnings
A forced synchronous layout (forced reflow) happens when JavaScript reads a layout property (like `scrollHeight`) before the browser has had a chance to compute layout styling for the current frame. Moving these reads to a `requestAnimationFrame` callback schedules the reading operations at a point in the rendering pipeline where style layouts are settled, completely silencing the console reflow warnings.
