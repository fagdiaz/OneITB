# Security Contracts

## Public registration

```graphql
mutation Register($input: RegisterInput!) {
  registerUser(input: $input) {
    id
    success
    message
  }
}
```

- Allowed public role: `Estudiante`.
- Allowed email: local part plus configured institutional domain.
- Rejections for existing identity and persistence conflict use `REGISTRATION_NOT_AVAILABLE` with a generic Spanish message.
- Policy validation errors use `REGISTRATION_POLICY_REJECTED` without leaking stack/database details.
- Excess requests use `RATE_LIMITED`.

## Private profile

`publicProfile(userId)` and `searchPublicProfiles` must calculate `canViewSensitiveProfile` as:

```text
profile is public OR viewer is owner OR viewer role is Administrador/Moderador
```

Follow is explicitly excluded.

## Academic management

| Operation | Admin | Professor linked to career | Professor outside career | Student/Graduate |
|---|---:|---:|---:|---:|
| Read resources | Allow | Allow | Deny | Allow only linked career |
| Create resource | Allow | Allow | Deny | Deny |
| Toggle resource | Allow | Allow | Deny | Deny |
| List students | Allow | Allow | Deny | Deny |
| Upsert progress | Allow | Allow | Deny | Deny |

## Production configuration

`ConnectionStrings__DefaultConnection` is supplied as `ONEITB_DB_CONNECTION_STRING`. The tracked compose template does not provide a certificate trust bypass.
