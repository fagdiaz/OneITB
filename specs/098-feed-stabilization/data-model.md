# Data Model: Inquiry Author

## Inquiry

- `Id`: publication identifier.
- `Title`: required publication title.
- `Content`: required publication body.
- `PublishDate`: publication timestamp.
- `UserId`: required foreign key to `User`.
- `User`: required author navigation.
- `SubjectId`: required foreign key to `Subject`.
- `Subject`: required subject navigation.

## Relationship

```text
User 1 ─── * Inquiry
```

- Foreign key: `Inquiry.UserId`.
- Delete behavior: `Restrict`.
- An inquiry cannot reference a missing user.
- A referenced user cannot be deleted through cascade behavior.
