# Evidence: End-to-End Subjects Module

**Date**: 2026-06-18

## Implemented

- Replaced obsolete `SubjectCareer` ownership with required `Subject.CareerId` and `Subject.Career`.
- Added nullable `Subject.Year` with a database range constraint.
- Added explicit `SubjectPrerequisite` and direct `Subject.Prerequisites` navigation.
- Configured career and both prerequisite foreign keys with `DeleteBehavior.Restrict`.
- Added a no-self-reference database constraint.
- Updated seed logic, filters, GraphQL mutations, Apollo contracts, form, and table.

## Migration

Migration: `20260618230159_AddAcademicRulesToSubjects`.

The migration adds nullable `CareerId`, backfills from legacy links, fills unmapped legacy rows, makes the column required, drops `SubjectCareers`, and creates `SubjectPrerequisites` with restricted FKs.

## Validation

- Backend Release build: passed with 0 errors; existing nullable warnings remain.
- Frontend Vite build: passed; existing Vite deprecation and chunk warnings remain.
- EF database update: passed.
- EF migration list: `20260618230159_AddAcademicRulesToSubjects` is latest.
- EF pending model check: no changes pending.

## Runtime Smoke

Blocked by the local execution environment. The temporary backend failed before exposing GraphQL because SQL Server requires encryption unsupported by that spawned session; Windows Event Log also rejected logger access. Migration application succeeded through EF CLI, but GraphQL and browser workflows remain unverified in this run.
