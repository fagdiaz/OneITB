# Data Model: Profile Data Binding Fixes

## User

- Add `AvatarUrl`: optional string, max 500.
- `FirstName`: normalized to title case.
- `LastName`: normalized to title case.

## UserCareer

- Existing N:M pivot between `User` and `Career`.
- Profile update may replace all links for a user with the submitted `careerIds`.

## Account

- `Email` remains validated and trimmed.
- Login lookup is case-insensitive.
- Existing email rows are normalized so the first stored character is uppercase for display.
