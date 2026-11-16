# Data Model: ATS-Friendly CV Export

## Persistence Impact

No EF Core entity, migration, GraphQL operation or database row changes.

## Existing Input Contract

`CVData` remains canonical:

1. `personalInfo`: name, title, email, phone, location/careers and professional URLs.
2. `summary`: professional profile.
3. `experience`: ordered visible work entries.
4. `education`: ordered visible education entries.
5. `projects`: ordered visible project entries.
6. `skills`: ordered visible skills.
7. `languages`: ordered visible languages.

Items with `hidden === true` are excluded. Empty sections do not produce headings.

## Derived Document Order

1. Identity and professional title.
2. Contact and links.
3. Professional profile.
4. Skills.
5. Experience.
6. Projects.
7. Education.
8. Languages.

The derived document is ephemeral. It must not be written to LocalStorage, Apollo cache,
SQL Server or logs.

## Validation Invariants

- Mandatory values are text nodes.
- URLs are normalized by existing safe URL helpers before becoming links.
- Stable item IDs are React keys only and do not appear in the document.
- Hidden/empty values cannot create placeholder content.
- Document height is content-driven and can span multiple pages.
