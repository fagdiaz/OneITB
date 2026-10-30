---
name: "speckit-error-boundary"
description: "Enforce safe error mapping, structured logging, recoverable UI states, and integration fallbacks without leaking internal details."
---

# Speckit Error Boundary

## Purpose

Keep failures inside the smallest useful recovery boundary while preserving a root fallback for unexpected React render failures. Backend errors must be observable to operators and safe for clients.

## Frontend Rules

1. Reuse the global application error boundary; add page or widget boundaries only where independent recovery adds value.
2. Handle Apollo loading, empty, network, authorization, and retry states explicitly.
3. Never perform state updates, navigation, cache writes, or side effects while rendering a fallback.
4. Clean up subscriptions, timers, listeners, abort controllers, and object URLs.
5. Show Spanish, actionable user messages and a correlation identifier when available. Do not display stack traces or raw server errors.

## Backend Rules

1. Do not expose `Exception.Message`, SQL details, stack traces, tokens, secrets, or personal data through GraphQL errors.
2. Map expected domain failures to stable error codes or typed payloads with sanitized messages.
3. Let the configured GraphQL error filter handle unexpected exceptions. Log them with `ILogger`, structured properties, and a correlation identifier.
4. Preserve `OperationCanceledException` semantics and propagate `CancellationToken`; cancellation is not an application error.
5. External adapters must define timeout, cancellation, fallback, and fail-open or fail-closed behavior explicitly.
6. Log security events without credentials, message content, CV data, or other unnecessary PII.

## Evidence

- Add negative-path tests for affected authorization, validation, adapter, or rendering behavior.
- Verify that client-visible errors remain sanitized and logs retain enough context for diagnosis.
- Record runtime checks separately from static/build evidence.
