# Feature Specification: Refactor all entities to English

**Feature Branch**: `011-refactor-all-entities-to-english`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Ejecutar una refactorización completa de TODAS las entidades del sistema al inglés bajo una nueva especificación (011), forzando el cumplimiento estricto del "Specify Protocol" (Specify -> Plan -> Tasks -> QA -> Implement) para asegurar que ninguna tabla quede en español en la base de datos."

## User Scenarios & Testing

### User Story 1 - Full English Schema Database (Priority: P1)
As a software architect, I want all database tables, columns, C# model properties, and GraphQL schemas to be strictly in English so that the project maintains code quality and complies with AD-006 naming standards.

**Why this priority**: Crucial for ensuring that no Spanish or Spanglish exists in DB tables, fields, C# domain properties, and APIs.

**Independent Test**: Build the C# solution, delete database, run EF Core migrations, and verify that the generated SQL schema contains exclusively English tables (`Subjects`, `Inquiries`, `Users`, `Accounts`) and English columns.

**Acceptance Scenarios**:
1. **Given** the database is rebuilt, **When** examining tables, **Then** only `Users`, `Accounts`, `Subjects`, and `Inquiries` exist.
2. **Given** `Inquiries` table, **When** examining columns, **Then** it has `Id`, `Title`, `Content`, `PublishDate`, `UserId`, and `SubjectId`.
3. **Given** `Subjects` table, **When** examining columns, **Then** it has `Id`, `Name`, and `Code`.

## Requirements

### Functional Requirements
- **FR-001**: Rename `Materia` entity and table to `Subject`.
- **FR-002**: Rename `Consulta` entity and table to `Inquiry`.
- **FR-003**: Rename all C# properties and EF Core configurations for `Subject` and `Inquiry` to English.
- **FR-004**: Re-run database drop, migrations, and database update to rebuild the database with the new schema.

### Key Entities
- **Subject** (formerly Materia): Representing an academic subject. Attributes: `Id`, `Name`, `Code`.
- **Inquiry** (formerly Consulta): Representing a query/question. Attributes: `Id`, `Title`, `Content`, `PublishDate`, `UserId`, `SubjectId`.

## Success Criteria
- **SC-001**: Clean compile of the solution.
- **SC-002**: Database recreated from scratch with zero Spanish tables or columns.
- **SC-003**: All references to Spanish entity classes/properties are successfully migrated.
