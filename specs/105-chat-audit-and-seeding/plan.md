# Implementation Plan: Chat Audit and Seeding

**Branch**: `[105-chat-audit-and-seeding]` | **Date**: 2026-06-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/105-chat-audit-and-seeding/spec.md`

## Summary

This plan covers the review and correction of the real-time private messaging module. It includes ensuring the correct WebSocket middleware pipeline order, strictly enforcing AD-004 delete restrictions on the `Message` table, validating the Apollo Client routing logic, and injecting historical test messages into the database.

## Technical Context

**Language/Version**: C# (.NET 8), JavaScript (React 18)

**Primary Dependencies**: ASP.NET Core MVC, Entity Framework Core, HotChocolate, Apollo Client

**Storage**: SQL Server (Entity Framework Core)

**Constraints**: `DeleteBehavior.Restrict` on `Message` entities, proper HTTP/WS splitting in React, and strict no git commit policy.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
Passes all gates. Meets AD-004 by confirming `DeleteBehavior.Restrict`.

## Project Structure

### Source Code

```text
API Graphql/
├── OneITB/
│   └── Startup.cs                  # Adjust UseWebSockets order
├── Data/
│   ├── OneItbContext.cs            # Verify Message EF configuration
│   └── DbInitializer.cs            # Add SeedMessagesData
└── Entities/
    └── Models/
        └── Message.cs              # View for compliance

FrontEnd/OneItb-FE/src/
└── data/graphql/
    └── GraphqlProvider.js          # Review Apollo split transport
```

**Structure Decision**: Will update `Startup.cs` to ensure `UseWebSockets` precedes `UseRouting`. `OneItbContext.cs` is already compliant. `GraphqlProvider.js` is already compliant. `DbInitializer.cs` will receive a new seed method.

## Complexity Tracking

None.
