# Data Model: Full Profile & CV Schema Normalization

## Entity: User

New field:

- `CvDataJson`: optional structured JSON text containing the extended CV document.

Existing profile fields still used:

- `Biography`
- `LinkedIn`
- `Facebook`
- `Instagram`
- `Phone`

## CV Data Document

Logical shape:

- `experience`: list of work experience entries.
- `education`: list of education entries.
- `projects`: list of project entries.
- `skills`: list of skill entries.
- `languages`: list of language entries.

Personal fields such as name, email, phone, LinkedIn and summary are derived from canonical profile fields and are not stored independently inside the extended CV document for editing purposes.

## Validation Rules

- `CvDataJson` is optional.
- If provided, it must be valid JSON.
- Maximum size is 20000 characters.
- Authorization follows `updateProfile`: self-edit only unless role is `Administrador`.
