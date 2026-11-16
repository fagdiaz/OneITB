# Data Model: Spec 166 Roadmap Quality Closure

No production schema changes are planned.

## Test Fixtures

- **Account/User**: Seeded with active, inactive, administrator, teacher and student variants.
- **Career/Subject/UserCareer**: Seeded to validate registration career links and feed career scoping.
- **Inquiry/Comment/Reaction**: Seeded or created by tests to validate feed behavior.

## CI Quality Gate

- **Workflow**: Declarative repository automation with no secrets. Executes deterministic commands only.

## Documentation Status

- **Canonical docs**: `ROADMAP.md`, `scope-and-requirements.md`, `architecture-and-design.md`, `DOCUMENTATION_STATUS.md`, `DEVELOPMENT_LOG.md`.
- **State transition**: Pending roadmap items may become `[x] [I]` only when backed by passing tests/builds/workflow evidence.
