# Quickstart: Realtime Private Messaging

## Prerequisites

- SQL Server available with the configured development connection.
- Seeded administrator, student and professor accounts.
- Frontend dependencies installed.

## Build and migrate

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef migrations add AddPrivateMessaging --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run build
```

## Runtime validation

1. Start the backend on an isolated local URL with matching HTTP and WebSocket endpoints.
2. Authenticate as the seeded student and professor.
3. Open `messageReceived` subscriptions with both JWTs.
4. Send a message from student to professor.
5. Verify one event reaches each participant and no third user can subscribe as either one.
6. Query `conversation` from both accounts and verify identical persisted history.
7. Mark the conversation read as the receiver and verify the unread count becomes zero.
8. Restart or reconnect the clients and verify history remains present without duplicates.
9. Start the frontend, open `/chat` in two browser sessions, exchange messages and inspect
   browser console/network state.

## Required negative checks

- `sendMessage` without JWT is rejected.
- Self-message is rejected.
- Empty and 2,001-character content are rejected.
- Inactive or nonexistent receiver is rejected.
- A socket with no token or an invalid token is rejected.
- A user cannot request messages between two unrelated users.

## Evidence

Record exact commands, ports, seeded accounts used, GraphQL responses, WebSocket event
counts, browser results, build outcomes and migration status in `evidence.md`.
