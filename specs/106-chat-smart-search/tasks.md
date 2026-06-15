# Tasks: Chat Smart Search

**Branch**: `[106-chat-smart-search]` | **Date**: 2026-06-14 | **Plan**: [plan.md](./plan.md)

## Implementation Steps

### Phase 1: Backend GraphQL Resolvers

- [x] **1.1. Add Interface Methods**: Update `IMessagingService.cs` with `GetActiveConversations` and `SearchMyMessages`.
- [x] **1.2. Implement Services**: Add EF Core logic to `MessagingService.cs` to execute these queries securely using the current user's ID.
- [x] **1.3. Expose GraphQL Queries**: Add `GetActiveConversations` and `SearchMyMessages` to `API Graphql/OneITB/GraphQL/Query.cs`.

### Phase 2: Frontend Refactor

- [x] **2.1. Update UI and Queries**: Refactor `PrivateChat.jsx` to execute new queries alongside `GET_USERS`, manage `searchTerm` state, and categorize search results following the 3 priority rules.
- [x] **2.2. Validation**: Ensure frontend compiles and runs correctly.

### Phase 3: Version Control

- [x] **3.1. Commit Changes**: Create a commit with the changes, per user instructions.
