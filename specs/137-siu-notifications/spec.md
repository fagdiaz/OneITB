# Feature Specification: SIU Sync and Notifications

**Feature Branch**: `137-siu-notifications`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "Cerrar definitivamente la prioridad P2 del ROADMAP.md implementando el Adaptador SIU Guarani y las Preferencias/Motor de Notificaciones en tiempo real."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Synchronize institutional grades (Priority: P1)

An administrator can synchronize grades for a selected subject from a simulated institutional source, updating existing academic progress records or creating the missing ones without duplicating progress for the same student and subject.

**Why this priority**: Grade synchronization closes the institutional integration gap for the academic module and gives administrators a repeatable workflow for loading official progress data.

**Independent Test**: Can be fully tested by selecting an active subject as an administrator, running synchronization, and verifying that student progress records are created or updated idempotently.

**Acceptance Scenarios**:

1. **Given** an administrator and an active subject, **When** the administrator runs SIU synchronization, **Then** the system imports matching student grades and reports how many records were created, updated and skipped.
2. **Given** the same subject has already been synchronized, **When** the administrator runs synchronization again, **Then** existing progress is updated in place and no duplicate student-subject progress records are created.
3. **Given** a non-administrator user, **When** they attempt to run synchronization, **Then** the system rejects the action.

---

### User Story 2 - Receive academic notifications (Priority: P2)

Users receive visible notifications when academic events affect them, such as a professor or administrator publishing a new resource for a subject in one of their careers or updating their academic progress.

**Why this priority**: Academic updates are only useful if students discover them quickly. Persistent and live notifications reduce missed material and make the academic module feel active.

**Independent Test**: Can be tested by publishing a resource or updating a student's progress and verifying that the affected user gets a persistent unread notification and a live alert while connected.

**Acceptance Scenarios**:

1. **Given** a student associated with the subject career, **When** a teacher or administrator creates a new academic resource for that subject, **Then** the student receives an unread notification with a useful destination.
2. **Given** a student whose progress was updated, **When** the update completes, **Then** the student receives an unread notification pointing to the academic progress view.
3. **Given** a user has unread notifications, **When** they open the notification menu, **Then** the newest notifications are visible and unread items are distinguishable.
4. **Given** a user marks one notification or all notifications as read, **When** the action completes, **Then** the unread count decreases accordingly and remains consistent after reload.

---

### User Story 3 - Manage notification preferences (Priority: P3)

Users can enable or disable categories of academic notifications so that the system only sends events they care about, while administrators keep operational visibility over synchronization outcomes.

**Why this priority**: Preferences prevent notification fatigue and complete the roadmap item for subject notification preferences without requiring a production external messaging provider.

**Independent Test**: Can be tested by disabling a preference, triggering the corresponding academic event, and verifying that no new notification is created for that user while other enabled categories still work.

**Acceptance Scenarios**:

1. **Given** a user disables resource notifications, **When** a new academic resource is published for an eligible subject, **Then** the user does not receive a resource notification.
2. **Given** a user keeps grade notifications enabled, **When** their academic progress changes, **Then** they still receive the grade notification.
3. **Given** no explicit preferences exist for a user, **When** an academic event occurs, **Then** default preferences allow academic notifications.

---

### Edge Cases

- If the simulated SIU source returns a student that does not exist locally or is not enrolled in the subject career, the system must skip that entry and include it in the sync summary.
- If a subject is inactive or missing, synchronization and resource-triggered notifications must fail safely without partial invalid writes.
- If a user is disconnected, their notification must remain persisted and visible after the next login.
- If live delivery is unavailable, persisted unread notifications must still preserve the event.
- If the same notification-triggering operation affects many students, each eligible user must receive at most one notification per event.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an administrator-only action to synchronize institutional grades for a selected active subject.
- **FR-002**: System MUST import simulated institutional grade records into academic progress using an idempotent create-or-update behavior.
- **FR-003**: System MUST report synchronization results including created, updated, skipped and total processed entries.
- **FR-004**: System MUST preserve existing academic authorization rules: students can only read their own progress and administrators can inspect progress by user.
- **FR-005**: System MUST create persistent notifications for academic resource publication and grade/progress updates when the affected user has the relevant preference enabled.
- **FR-006**: System MUST expose each authenticated user's own notification list, unread count, mark-one-read action and mark-all-read action.
- **FR-007**: System MUST deliver academic notifications live to connected affected users while also persisting them for later retrieval.
- **FR-008**: System MUST let users view and update notification preferences for academic resource and grade categories.
- **FR-009**: System MUST default notification preferences to enabled when a user has not configured them.
- **FR-010**: System MUST avoid sending notifications to inactive users and must avoid duplicate notifications for the same event and recipient.
- **FR-011**: System MUST keep SIU synchronization decoupled from the internal academic model so a real institutional provider can replace the simulated source later.
- **FR-012**: System MUST reject unauthorized synchronization and notification-management attempts without relying on frontend-only controls.

### Key Entities *(include if feature involves data)*

- **Institutional Grade Record**: A grade item received from the institutional source, associated with a student identity, subject, score and academic status.
- **SIU Sync Result**: Summary of one synchronization run, including created, updated, skipped and processed counts.
- **Notification**: Persistent user-facing alert containing recipient, message, destination, read state and creation time.
- **Notification Preference**: A user's opt-in/opt-out state for academic notification categories.
- **Academic Progress**: Existing student-subject progress record updated by synchronization and manual academic grading.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An administrator can synchronize a subject and see a clear result summary in under 3 user actions from the academic dashboard.
- **SC-002**: Re-running synchronization for the same subject does not create duplicate progress records for any student.
- **SC-003**: 100% of eligible connected users receive a live notification for academic resource and progress events during runtime validation.
- **SC-004**: 100% of eligible disconnected users can see persisted unread notifications after the event.
- **SC-005**: Users can mark notifications as read and see the unread count update in the same session.
- **SC-006**: Users who disable a notification category do not receive new notifications of that category during validation.

## Assumptions

- The first version uses a simulated institutional source and does not call the real SIU Guarani network service.
- Existing users, careers, subjects and academic progress records remain the local source of truth after synchronization.
- Default notification preferences are enabled to avoid silently hiding academic updates.
- Live delivery is best-effort; persisted unread notifications are the authoritative fallback.
- Mobile notification delivery and email/push providers are out of scope for this feature.
