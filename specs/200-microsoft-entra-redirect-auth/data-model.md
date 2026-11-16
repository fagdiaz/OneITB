# Data Model: Microsoft Entra Redirect Authentication

No persistent domain or database model changes are required.

## Ephemeral Redirect Flow

| Field | Type | Rule |
|---|---|---|
| `id` | UUID string | Generated before redirect; never supplied by a user |
| `returnTo` | string | Sanitized internal path; defaults to `/feed` |
| `createdAt` | integer | Millisecond timestamp used to expire stale flow metadata |
| `completed` | boolean | Prevents a callback reload from repeating the exchange |

The descriptor is stored in `sessionStorage` for same-tab redirect continuity. It contains
no Microsoft token, OneITB JWT, password, or personal profile data.

## In-Memory Completion Registry

The registry maps `flowId` to a Promise. Pending and fulfilled transactions are reused to
prevent duplicate side effects. Rejected entries are removed to permit an explicit retry.
