# Research: QA Resolution and UX Polish

## Decision: HotChocolate limits

Raise `GraphQL:MaxExecutionDepth` from 10 to 15 and add explicit parser node/field limits via `ModifyParserOptions`. HotChocolate 14 exposes `RequestParserOptions.MaxAllowedNodes`, `MaxAllowedTokens` and `MaxAllowedFields`; `RequestExecutorOptions` does not expose the prompt's suggested `MaxAllowedNodeCount`.

## Decision: Alias removal

Do not remove legacy `User.alias` GraphQL field because existing profile queries still request it. Remove the user-facing Alias field from registration and derive `username` from email local-part to keep the current `RegisterInput` contract stable.

## Decision: Header overflow

Use `w-full`, `max-w-full`, `min-w-0`, `overflow-x-hidden` at layout boundaries and reduce nav gap on constrained widths. Do not hide dropdowns with a parent overflow rule that would clip them.

## Decision: Global search selected filters

Selected career and subject labels should have explicit selected classes with readable text/background independent from parent dark surface.

## Decision: Chat widget close behavior

Use a root `ref`, route-change `useEffect`, and document `mousedown` listener. The floating toggle is inside the root ref, so click-outside does not close immediately after opening.
