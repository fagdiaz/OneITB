# Feature Specification: Apply Profile Migration (021)

**Feature Branch**: `021-apply-profile-migration`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Ejecutar los comandos de CLI de Entity Framework Core desde el agente para generar la migración y actualizar la base de datos, saltando el bloqueo de la terminal local del usuario."

## User Scenarios & Testing

### User Story 1 - Persist Bio & Socials in DB (Priority: P1)
As a developer, I want the database schema to contain columns for biography and social networks so that user profiles details persist correctly.

**Acceptance Scenarios**:
1. **Given** C# model changes exist, **When** EF Core migrations update command is run, **Then** SQL Server schema is successfully updated with Biography, LinkedIn, Facebook, Instagram, and Phone columns.

## Requirements

### Functional Requirements
- **FR-001**: Apply EF Core migration to SQL Server using command line execution.
