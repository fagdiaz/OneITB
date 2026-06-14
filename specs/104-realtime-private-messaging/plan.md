# Implementation Plan: Realtime Private Messaging

**Branch**: `104-realtime-private-messaging` | **Date**: 2026-06-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/104-realtime-private-messaging/spec.md`

## Summary

Add persisted one-to-one messages with explicit restricted sender and receiver
relationships, a messaging service/repository boundary, authenticated GraphQL queries,
mutations and per-user subscriptions, and a responsive Apollo-driven chat. HTTP operations
continue through `/graphql`; subscription operations use the GraphQL WebSocket protocol on
the same endpoint and authenticate during `connection_init`.

## Technical Context

**Language/Version**: C# 12 / .NET 8; JavaScript / React 18

**Primary Dependencies**: HotChocolate 14.2, EF Core 8.0.6, SQL Server, Apollo Client
3.7, `graphql-ws`, React Router 6, Tailwind CSS 4

**Storage**: SQL Server through EF Core Code First

**Testing**: Release builds, EF migration checks, authenticated GraphQL operations,
two-client WebSocket exchange, persistence reload, browser workflow and console review

**Target Platform**: ASP.NET Core web server and modern desktop/mobile web browsers

**Project Type**: Full-stack web application

**Performance Goals**: New messages visible within two seconds locally; bounded history
reads; no per-message relationship query; indexed participant and chronology lookups

**Constraints**: JWT identity only, `DeleteBehavior.Restrict`, zero shadow properties,
cursor pagination for lists, no polling, no hardcoded endpoint URLs, no page reloads,
controlled Spanish UI errors, no commit or push

**Scale/Scope**: One-to-one plain-text messaging for active users. The in-memory event
provider supports the current single backend instance; the service/topic contract remains
replaceable by a distributed provider later.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **GraphQL boundary**: PASS. Queries, mutations and subscriptions share `/graphql`.
- **Service delegation**: PASS. Resolvers delegate persistence and authorization checks to
  `IMessagingService`; repositories integrate through `IUnitOfWork`.
- **Security**: PASS. Sender and subscription topic derive from validated JWT claims.
- **Input validation**: PASS. Content is trimmed and bounded; no new regex input exists.
- **Relational integrity**: PASS. Both user relationships are explicit and restricted.
- **Session management**: PASS. HTTP and WebSocket transports read the unified `token`.
- **Evidence gate**: PASS by design. Runtime WebSocket, authorization and reload checks are
  mandatory before completion.

Post-design re-check: PASS. No constitutional exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/104-realtime-private-messaging/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- graphql.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
API Graphql/
|-- Entities/Models/Message.cs
|-- Data/OneItbContext.cs
|-- Data/Migrations/
|-- Services/Interfaces/IUnitOfWork.cs
|-- Services/Repositories/UnitOfWork.cs
|-- Services/Messaging/
|   |-- IMessagingService.cs
|   `-- MessagingService.cs
`-- OneITB/
    |-- Authentication/AuthenticationSocketSessionInterceptor.cs
    |-- GraphQL/Query.cs
    |-- GraphQL/Mutation.cs
    |-- GraphQL/Subscription.cs
    `-- Startup.cs

FrontEnd/OneItb-FE/
|-- src/data/graphql/GraphqlProvider.js
|-- src/data/graphql/chat.js
|-- src/Components/chat/PrivateChat.jsx
|-- src/Components/layout/private/Nav.jsx
|-- src/Components/layout/private/PrivateLayout.jsx
`-- src/router/Routing.jsx
```

**Structure Decision**: Extend the existing backend projects and Apollo provider rather
than introducing a separate chat service. Messaging domain logic is isolated in a service
and repository contract; UI state remains local to the chat page with Apollo cache as the
server-state source.

## Complexity Tracking

No violations.
