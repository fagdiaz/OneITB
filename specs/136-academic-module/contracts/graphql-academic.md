# GraphQL Contract: Academic Module

All operations are protected unless noted otherwise. Field names follow existing HotChocolate camelCase output.

## Queries

### `academicResources(subjectId: Int!): [AcademicResource!]!`

Returns active resources for a subject.

Authorization:
- `Administrador` and `Profesor`: allowed.
- Other authenticated users: allowed only when the user is associated with the subject career.

Expected fields:

```graphql
query AcademicResources($subjectId: Int!) {
  academicResources(subjectId: $subjectId) {
    id
    title
    description
    fileUrl
    externalUrl
    resourceType
    createdAt
    isActive
    subject { id name code career { id name code } }
    uploader { id firstName lastName role }
  }
}
```

### `myAcademicProgress: [AcademicProgress!]!`

Returns progress records for the authenticated user.

### `academicProgressForUser(userId: UUID!): [AcademicProgress!]!`

Returns progress records for a user. `Administrador` only.

### `academicStudents(subjectId: Int!): [User!]!`

Returns active students associated with the career of the selected subject. `Profesor` and `Administrador` only. This supports grade assignment without exposing the full admin user list to teachers.

## Mutations

### `addAcademicResource(subjectId, title, description, fileUrl, externalUrl): AcademicResource!`

Authorization:
- `Profesor`
- `Administrador`

Validation:
- Active subject required.
- At least `fileUrl` or `externalUrl` required.
- `fileUrl` must begin with `/uploads/` when present.
- `externalUrl` must be absolute `http` or `https` when present.

### `toggleAcademicResourceStatus(resourceId: UUID!): AcademicResource!`

Authorization:
- `Profesor`
- `Administrador`

Behavior:
- Flips `isActive`.
- Normal resource query only returns active resources.

### `upsertAcademicProgress(userId, subjectId, score, status, notes): AcademicProgress!`

Authorization:
- `Profesor`
- `Administrador`

Validation:
- Active target user and active subject required.
- Score must be null or between 0 and 10.
- Status must be one of `InProgress`, `Regular`, `Approved`, `Free`.
- Existing `(userId, subjectId)` record is updated instead of duplicated.

## Negative Contract Cases

- Student calling `addAcademicResource` must fail authorization.
- Student calling `academicProgressForUser` for another user must fail authorization.
- Resource without file and link must fail validation.
- Progress with score above 10 must fail validation.
