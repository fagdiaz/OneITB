# Search Rescue and DB Reset

## Context & Motivation
Following the iteration of the header search bar and cascading filters, the search component was improperly placed inside the Navigation component instead of directly in the Header, leading to layout hierarchy issues. Additionally, the local state management inside the `Feed.jsx` component caused undefined or null variables to be sent via Apollo Client when processing URL parameters, triggering GraphQL validation errors. Furthermore, the frontend is lacking visual safeguards for older database entries missing the newly added `Code` field. 

This spec addresses the layout correction, ensures bulletproof state handling in Apollo queries, adds resilience against missing codes, and provides the user with clear instructions to reset the development database.

## Scope & Boundaries
**In Scope:**
- Removal of `GlobalSearch` from `Nav.jsx`.
- Re-implementation of `GlobalSearch` or a search trigger directly into `Header.jsx`.
- Strict validation and fallback logic in `Feed.jsx` for URL parameters mapped to GraphQL variables.
- Console logging of Apollo errors in `Feed.jsx`.
- Addition of optional chaining (`?.`) when rendering `Code` properties in the UI to prevent crashes.
- Provision of explicit CLI commands for EF Core database reset.

**Out of Scope:**
- Any further backend modifications (strictly frontend fixes).
- Changes to other layout components outside of `Nav.jsx` and `Header.jsx`.
- Alteration of existing GraphQL schema or queries outside the required variable fallbacks.

## Key Scenarios & Use Cases

### Scenario 1: Clean Layout Hierarchy
*   **Context:** The user views the main application header.
*   **Action:** The user observes the navigation links and the search bar.
*   **Expected Outcome:** The search bar/icon is structurally a child of the `Header` component, independent of the main `Nav` component logic, keeping separation of concerns intact.

### Scenario 2: Empty URL Parameters Handling
*   **Context:** The user visits `/feed` without any search parameters in the URL.
*   **Action:** The `Feed` component initializes and executes `GET_INQUIRIES` and `GET_SUBJECTS`.
*   **Expected Outcome:** The GraphQL variables for these queries correctly default to safe fallbacks (e.g., `null` or omission) instead of `undefined`. No GraphQL syntax/validation errors are thrown.

### Scenario 3: Legacy Data Resilience
*   **Context:** A user opens the global search filter.
*   **Action:** The application fetches and displays available careers and subjects, some of which may be legacy records without a `code` value.
*   **Expected Outcome:** The UI renders properly, using optional chaining to fail gracefully (e.g., leaving the code blank) rather than crashing the React application.

## Open Questions
- Is there any specific z-index value required for the GlobalSearch dropdown to prevent overlapping issues with specific inner-page elements, or is a generic high z-index (e.g., `z-50`) sufficient? (Assuming generic `z-50` is sufficient unless indicated otherwise).
