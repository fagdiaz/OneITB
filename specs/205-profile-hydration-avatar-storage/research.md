# Research: Profile Hydration and Avatar Storage

## Canonical state

The auth context intentionally stores a compact identity for route guards. It may contain
less profile data than GraphQL. Using it to render editable fields creates visible false
state and can reintroduce session bleed. The editor must wait for `me` and verify the ID.

## Avoiding the late-refetch reset

A one-time hydration key composed from session version and user ID is safer than an effect
that depends on the complete auth/query objects. Dirty state prevents background cache
updates from replacing local edits. A deliberate reset/reload action can opt in to a new
hydration.

## Storage selection

The backend already injects `LocalFileStorageService` when `CloudinarySettings:Url` is
empty and `CloudinaryStorageService` otherwise. That is the correct local-resilience
pattern. The missing work is acceptance, UX transparency and regression coverage, not
direct cloud credentials in React.

## Upload transaction boundary

Binary storage and relational profile persistence cannot be one SQL transaction. The UI
must treat them as staged operations, preserve the previous persisted URL on failure and
rely on orphan cleanup for uploaded-but-unreferenced files.

