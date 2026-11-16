# Research: Media Preview Stabilization

## Decision: static YouTube thumbnail

Use `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg` for the preview card. This restores visual context without mounting the iframe or executing YouTube player scripts during initial render.

## Decision: shared attachment rendering

`MediaAttachment` already knows how to resolve relative upload paths through `apiBaseUrl`. `MediaComponent` duplicated file rendering and used raw relative URLs, causing broken images in Vite. Reusing the shared component reduces divergence.

## Decision: image fallback

If an uploaded image fails to load, render the existing file-card fallback for the same URL. This keeps the attachment usable and avoids the browser showing only alt text.
