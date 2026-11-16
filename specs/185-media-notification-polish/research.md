# Research: Media and Notification Polish

## Findings

- `PdfFirstPageThumbnail` already uses local PDF.js worker, lazy import, IntersectionObserver and cancellation. The fix is presentation, not a new renderer.
- The current parser returns only the first YouTube ID, so a two-link requirement needs an ordered list while maintaining backward compatibility.
- `SocialService` currently bounds content length but does not bound YouTube URLs; client-only enforcement would be bypassable.
- `NotificationService.GetUnreadCountAsync` already executes `CountAsync(n => n.UserId == userId && !n.IsRead)`. The defect risk is cache/UI semantics and grouped-notification regression, not a schema change.
- `NotificationPreferencesModal` is declared under the transformed sticky Header. Fixed descendants can be clipped or positioned relative to transformed ancestors; a body portal removes that coupling.
- The global texture is behind highly opaque root surfaces, making effective opacity negligible. It should become a pointer-inert overlay below interactive layers and disappear in print.

## Rejected Alternatives

- **Embed PDFs in iframes**: rejected because local canvas rendering is safer and preserves anti-framing headers.
- **Persist image orientation**: rejected as redundant schema expansion for presentational metadata.
- **Use aggregate count as badge**: rejected because aggregate history and unread-state cardinality are different concepts.
- **Install media/layout libraries**: rejected; current browser and React primitives are sufficient.
- **Force Home to light mode**: rejected because the approved dual-theme contract can be preserved with a subtle logo treatment.
