# GraphQL Contract: Normalized Profile/CV

## Query `me`

```graphql
query GetUserProfile {
  me {
    id
    firstName
    lastName
    role
    biography
    linkedIn
    facebook
    instagram
    phone
    cvExperiences { id company role startDate endDate location description isHidden sortOrder }
    cvEducations { id institution degree startDate endDate location description isHidden sortOrder }
    cvProjects { id name role startDate endDate url description isHidden sortOrder }
    cvSkills { id name level isHidden sortOrder }
    cvLanguages { id name level isHidden sortOrder }
  }
}
```

## Mutation `updateProfile`

```graphql
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    success
    message
    id
  }
}
```

Input includes profile basics plus `cvExperiences`, `cvEducations`, `cvProjects`, `cvSkills`, and `cvLanguages`.
