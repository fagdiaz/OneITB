# Data Model: Feed Gamification UX

No new persisted data model is required.

## Read Models

### User Metrics

- `totalPosts`
- `totalComments`
- `totalLikesReceived`
- `totalReportsReceived`

Used to render participation badges and moderation context.

### Inquiry

- Existing publication fields.
- Uses author role/metrics, reactions, comments, and report count.

### Comment

- Existing nested comment fields.
- Uses author role/metrics and report count.
