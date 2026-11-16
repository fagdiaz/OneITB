# Feature Specification: Upload and Magic Link Abuse Hardening

**Feature Directory**: `specs/190-upload-magiclink-hardening`  
**Created**: 2026-07-27  
**Status**: Implemented; verified by static analysis, automated tests and upload runtime smoke  
**Audit Source**: `docs/audit/FINAL_AUDIT_REPORT.md` (C-1 and C-2)

## Problem Statement

The upload boundary accepts files after checking size, extension and the content type declared by the client. Those values do not prove the actual file format. The public employer Magic Link operations are covered by a broad per-IP limit, but they do not have operation-specific limits that constrain repeated requests against one identity or credential.

## User Scenarios & Testing

### User Story 1 - Valid educational files remain usable (Priority: P0)

An authenticated user uploads a supported image, document, archive or video whose content matches its declared format. The file is accepted and remains compatible with local and cloud storage.

**Independent Test**: Submit one valid fixture for every supported format and verify the response metadata and stored resource.

### User Story 2 - Disguised files are rejected before persistence (Priority: P0)

An authenticated user renames arbitrary or executable content with an allowed extension. The request is rejected before either storage provider receives the file.

**Independent Test**: Submit mismatched extension, MIME and binary signatures and prove no local/cloud write occurs.

### User Story 3 - Magic Link abuse is bounded without account enumeration (Priority: P0)

Repeated Magic Link requests or redemption attempts are constrained by identity and network source. Rejections use a generic response and expose neither account existence nor the one-time credential.

**Independent Test**: Exceed each configured threshold from the same and different sources and verify deterministic throttling, expiry and recovery.

### User Story 4 - Local development remains reproducible (Priority: P1)

The same security contract works without Redis, while production can use a shared limiter when configured.

## Functional Requirements

- **FR-001**: Upload acceptance MUST require agreement between extension, declared media type and verified file structure.
- **FR-002**: Validation MUST occur before any local or cloud persistence call.
- **FR-003**: Supported signatures MUST cover PDF, PNG, JPEG, GIF, WebP, legacy Office, OOXML Office, ZIP, MP4 and WebM.
- **FR-004**: OOXML formats MUST be distinguished from generic ZIP files by required package entries.
- **FR-005**: Plain-text validation MUST reject binary/NUL-heavy payloads while allowing valid UTF-8 educational text.
- **FR-006**: Validation MUST remain bounded by the existing 15 MB aggregate file limit and MUST honor cancellation.
- **FR-007**: Invalid uploads MUST return a sanitized 4xx response and MUST not expose parser internals or file content.
- **FR-008**: Magic Link request and redemption MUST use operation-specific, configurable limits in addition to the existing global HTTP limit.
- **FR-009**: Limiter keys MUST combine appropriate network and normalized identity dimensions without storing/logging raw credentials.
- **FR-010**: A distributed limiter MUST be preferred when configured; a deterministic in-memory fallback MUST preserve local development and tests.
- **FR-011**: Throttle responses MUST be generic, stable and include no account-existence signal.
- **FR-012**: Concurrency at the threshold MUST not grant more successful attempts than configured.
- **FR-013**: Existing authenticated upload and valid Magic Link behavior MUST remain compatible.
- **FR-014**: Client-source keys behind a reverse proxy MUST honor forwarded headers only from explicitly trusted proxies/networks.

## Edge Cases

- Empty, truncated or polyglot-looking payloads.
- ZIP/OOXML packages with missing canonical entries, excessive entry counts or malformed central directories.
- A stream that cannot seek, is cancelled mid-inspection or is read more than once.
- Upper/lower-case extensions and alternate valid MIME values.
- Requests behind a trusted reverse proxy where client IP forwarding must be explicit.
- Concurrent requests for the same normalized email.
- Redis unavailable at startup or during a request.

## Success Criteria

- **SC-001**: 100% of allowed file families have positive and mismatch fixtures.
- **SC-002**: 100% of disguised/truncated fixtures are rejected before storage is invoked.
- **SC-003**: Concurrency tests never exceed configured Magic Link permits.
- **SC-004**: Throttled responses reveal no account or token information.
- **SC-005**: Backend tests, Release build and upload runtime smoke pass; Magic Link threshold and recovery are verified by deterministic automated tests without starting an additional server process.

## Out of Scope

- Antivirus/malware scanning by an external vendor.
- Deep document content moderation.
- Changing the 15 MB product limit.
- Replacing the Magic Link delivery contract; credential delivery is Spec 192.
