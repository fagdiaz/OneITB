# Implementation Plan: Chat Smart Search

**Branch**: `[106-chat-smart-search]` | **Date**: 2026-06-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/106-chat-smart-search/spec.md`

## Summary

This plan covers the implementation of a 3-tier search system for the chat sidebar.
1. Active Conversations matching the keyword
2. New Users matching the keyword
3. Historical messages containing the keyword

## Technical Context

**Language/Version**: C# (.NET 8), JavaScript (React 18)

**Primary Dependencies**: HotChocolate, Apollo Client

**Storage**: SQL Server (Entity Framework Core)

**Constraints**: `Rules of Hooks` apply for Apollo queries. Search queries must restrict strictly to the authenticated user. Commits allowed but no pushes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
Passes all gates. Uses `IQueryable` for HotChocolate data loaders.

## Project Structure

### Source Code

```text
API Graphql/
├── Services/
│   ├── Interfaces/IMessagingService.cs # Add methods
│   └── Messaging/MessagingService.cs   # Implement active conversations and message search
└── OneITB/
    └── GraphQL/Query.cs                # Map GraphQL resolvers

FrontEnd/OneItb-FE/src/
└── Components/
    └── chat/PrivateChat.jsx            # Refactor UI to 3 categories
```

**Structure Decision**: Will implement backend queries first, expose via `Query.cs`, then refactor `PrivateChat.jsx` keeping Hooks unconditional.
