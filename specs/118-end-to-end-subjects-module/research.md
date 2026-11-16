# Research: End-to-End Subjects Module

## Decision: Replace `SubjectCareer` with mandatory `Subject.CareerId`

**Rationale**: The new rule states exactly one owning career. Keeping both models would create contradictory ownership and filtering behavior.

**Alternatives considered**: Keeping the N:M table plus a primary career was rejected because it preserves two sources of truth.

## Decision: Explicit directed join entity for prerequisites

**Rationale**: `SubjectPrerequisite` makes both FK properties explicit, supports a composite key, and allows `DeleteBehavior.Restrict` on each relationship.

**Alternatives considered**: EF skip navigations were rejected because FK naming and delete behavior are less visible.

## Decision: Validate same-career prerequisites in backend

**Rationale**: UI filtering is not a security/integrity boundary; direct GraphQL calls must also be validated.

## Decision: Update creation and editing contracts together

**Rationale**: Leaving edit limited to code/name would silently lose the ability to correct academic configuration.
