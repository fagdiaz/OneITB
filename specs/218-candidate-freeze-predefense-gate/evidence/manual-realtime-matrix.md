# Manual Realtime and Session Matrix

**Status reconciliation (2026-08-08):** T022 remains open and `NOT RUN`. The defense
planned for 2026-08-07 did not occur, and no new defense date or final candidate SHA is
documented.

**Candidate SHA:** pending  
**Client A:** isolated profile, identity pending  
**Client B:** isolated profile, identity pending

| Step | Expected result | Result | Evidence/deviation |
|---|---|---|---|
| A and B login independently | Header/cache show the correct identity in each profile | NOT RUN | |
| A sends message to B | Only B receives the event and unread increment | NOT RUN | |
| B opens conversation | B unread count becomes current unread total, not history | NOT RUN | |
| Notification event | Correct user/topic receives one deduplicated notification | NOT RUN | |
| B disconnects/reconnects | Subscription restores without duplicate events | NOT RUN | |
| A logs out | Transport stops, cache clears, protected data disappears | NOT RUN | |
| A logs in as a third identity | No messages/avatar/profile from prior identity remain | NOT RUN | |
| Both clients close | No owned WebSocket/process remains | NOT RUN | |
