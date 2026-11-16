# Data Model: End-to-End Subjects Module

## Subject

- `Id: int`
- `Name: string`
- `Code: string`
- `CareerId: int` required
- `Year: int?`, valid range 1-6
- `IsActive: bool`
- `Career: Career`
- `PrerequisiteLinks: ICollection<SubjectPrerequisite>`
- `RequiredByLinks: ICollection<SubjectPrerequisite>`
- `Prerequisites`: GraphQL-facing collection resolved through prerequisite links

## Career

- Existing entity.
- Adds `Subjects: ICollection<Subject>`.

## SubjectPrerequisite

- `SubjectId: int`
- `PrerequisiteId: int`
- Composite key: `(SubjectId, PrerequisiteId)`
- Both relationships use restricted deletion.
- Check constraint prevents `SubjectId == PrerequisiteId`.

## Validation Rules

- Career must exist and be active.
- Year is null or between 1 and 6.
- All prerequisite IDs must exist, be active, and belong to the selected career.
- Duplicate prerequisite IDs are removed before persistence.
