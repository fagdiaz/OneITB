# Implementation Plan: Frontend Console Runtime Cleanup

**Branch**: `129-console-runtime-cleanup` | **Date**: 2026-06-19 | **Spec**: [spec.md](spec.md)

## Summary

Activate mini-chat subscriptions only while chat is in use, and replace the anonymous link-preview REST fetcher with an authenticated, bounded GraphQL contract that rejects SSRF targets.

## Technical Context

**Language/Version**: C# / .NET 8; JavaScript / React 18
**Primary Dependencies**: HotChocolate 14.2, Apollo Client 3.7, graphql-ws, Tailwind CSS 4
**Storage**: No schema changes
**Testing**: Release builds, validator checks, GraphQL operation, clean-browser console inspection
**Target Platform**: ASP.NET Core and modern web browsers
**Project Type**: Full-stack web application
**Performance Goals**: Preview succeeds or fails within five seconds with a bounded response
**Constraints**: Canonical `/graphql`, JWT, no warning suppression, no dependency upgrades
**Scale/Scope**: Feed preview and private message subscription startup

## Constitution Check

- PASS: Business metadata uses `/graphql`; no REST exception is added.
- PASS: Preview requires JWT and validates untrusted input.
- PASS: Messaging keeps participant-scoped WebSocket authentication.
- PASS: No relational model change.
- PASS: Runtime evidence is required.

## Project Structure

```text
API Graphql/OneITB/GraphQL/Query.cs
API Graphql/Services/LinkPreviews/
FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx
FrontEnd/OneItb-FE/src/Components/publication/
FrontEnd/OneItb-FE/src/data/graphql/
specs/129-console-runtime-cleanup/
```

**Structure Decision**: Put outbound validation and fetching in a backend service, expose a thin GraphQL query, and reuse one Apollo operation in both preview surfaces.

## Complexity Tracking

No constitutional violations are accepted.
