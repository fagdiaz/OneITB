# Validation Quickstart

1. Build backend and frontend in their required modes.
2. Start both applications with normal development profiles.
3. Load the feed in a clean browser profile with mini chat collapsed.
4. Confirm no application-owned console issue and no `MessageReceived` socket until chat opens.
5. Open mini chat and verify the authenticated subscription connects.
6. Execute `linkPreview` with a public URL and verify metadata or graceful failure.
7. Verify rejection of loopback, private, link-local, credential-bearing, nonstandard-port, and redirect-to-private URLs.
