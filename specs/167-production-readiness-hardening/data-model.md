# Data Model: Production Readiness Hardening

No persistent schema changes are introduced.

## Correlation Identifier

- **Value**: `string`
- **Source**: incoming `X-Correlation-ID` header when valid, otherwise generated server-side.
- **Validation**: non-empty, max 128 characters, safe ASCII characters only.
- **Lifecycle**: request-scoped; returned in response header and included in log scope.

## Metric Count

- **User metric key**: `User.Id`
- **Inquiry metric key**: `Inquiry.Id`
- **Values**:
  - `totalPosts`
  - `totalComments`
  - `totalLikesReceived`
  - `totalReportsReceived`
  - `reportCount`
- **Persistence**: calculated from existing relational tables using grouped queries.

## Evidence Record

- **File**: `specs/167-production-readiness-hardening/evidence.md`
- **Fields**: command, result, blocker when applicable, timestamp/notes.
