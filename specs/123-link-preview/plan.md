# Implementation Plan: Automatic Link Preview & Unified Media Component

## Phase 1: Backend Metadata Proxy
- Create `MetadataController.cs` in `API Graphql/OneITB/Controllers`.
- Implement a `[HttpGet]` endpoint `/api/metadata`.
- Use `HttpClient` to fetch the target HTML.
- Set a strict timeout (e.g., 3s) and handle exceptions with a try-catch, returning `{ success = false }` on failure so the API doesn't crash or hang.
- Parse `og:title`, `og:description`, `og:image` (or standard title) via Regex.
- Return a JSON DTO. No DB changes are needed as the text stores the link.

## Phase 2: Unified Media Component (Frontend)
- Create `src/Components/publication/MediaComponent.jsx`.
- Props: `textContext`, `fileUrl`, and `previewData`.
- Logic:
  - If a YouTube link is found, extract ID and render `<iframe src="https://www.youtube.com/embed/ID">` with `aspect-video w-full rounded-xl`.
  - If `fileUrl` is present, render an `<img>`.
  - If a standard link is found and `previewData` is provided, render a premium Link Preview card using Tailwind v4 (subtle borders, `line-clamp-2`, `rounded-xl`, `bg-slate-50`).
- Refactor `Feed.jsx` and `CommentThread.jsx` to replace scattered rendering logic with `<MediaComponent />`.

## Phase 3: Real-Time Drafting (Frontend)
- Update the Post Input in `Feed.jsx`.
- Add a `useEffect` that watches the post text state.
- Use a Regex to detect `http://` or `https://`.
- If a URL is detected and hasn't been fetched, `fetch('/api/metadata?url=...')`.
- Store the result in a local `linkPreviewData` state.
- Render `<MediaComponent previewData={linkPreviewData} />` above the post/attachment buttons.
- If the URL is removed from the text, clear `linkPreviewData`.
