# GraphQL Contract: Subjects

## Query

```graphql
query GetSubjects($careerId: Int) {
  subjects(careerId: $careerId) {
    id
    code
    name
    year
    isActive
    career { id name code }
    prerequisites { id code name year }
  }
}
```

## Create

```graphql
mutation AddSubject($name: String!, $code: String!, $careerId: Int!, $year: Int, $prerequisiteIds: [Int!]) {
  addSubject(name: $name, code: $code, careerId: $careerId, year: $year, prerequisiteIds: $prerequisiteIds) {
    id
    code
    name
    year
    career { id name }
    prerequisites { id code name }
  }
}
```

## Update

`updateSubject` accepts the same academic fields plus `id: Int!`.
