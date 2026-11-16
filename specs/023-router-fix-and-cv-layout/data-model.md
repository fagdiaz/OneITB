# Data Model Design: Router Fix & CV Layout (023)

## Entity Mapping
The entities remain unchanged from the backend GraphQL schema integration:
- `User`: Handles details (`biography`, `phone`, `linkedIn`, `facebook`, `instagram`).
- `UpdateProfileInput`: Input schema for updating profile details.

## UI Data Flow Diagram
```mermaid
graph TD
    UserProfile[UserProfile Component] -->|useQuery GET_USER_PROFILE| LocalState[Form State & Profile State]
    LocalState -->|Render Left Column| CVCard[CV Preview Card]
    LocalState -->|Render Right Column| EditForm[Update Form Input Fields]
    EditForm -->|Submit Form| ApolloMutation[useMutation UPDATE_PROFILE]
    ApolloMutation -->|Refetch Query| UserProfile
```
