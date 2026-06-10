# Feature Specification: User Profiles Bio & Socials (020)

**Feature Branch**: `020-user-profiles-bio`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Implementar el Módulo 2 (CU-06 y T2.2). Expandir la entidad User en SQL Server para soportar biografía y redes sociales, crear los resolvers de GraphQL correspondientes, y construir componentes de frontend profesionales (estilo LinkedIn) para visualizar y editar el perfil."

## User Scenarios & Testing

### User Story 1 - View User Profile & Bio (Priority: P1)
As a logged-in student or professor, I want to navigate to my profile page to view my biography, personal information, and links to external networks (LinkedIn, Facebook, Instagram).

**Acceptance Scenarios**:
1. **Given** a user is logged in, **When** they view their profile page, **Then** they see their full name, bio, and social network links.

---

### User Story 2 - Edit Profile & Social Links (Priority: P2)
As a user, I want to edit my biography and social media links through a professional settings form, and have the changes persist in the database.

**Acceptance Scenarios**:
1. **Given** a user edits their bio, **When** they submit the form, **Then** the updated biography is saved in SQL Server and renders on reload.

## Requirements

### Functional Requirements
- **FR-001**: Expand `User` entity to store biography and social media fields.
- **FR-002**: Expose fields through HotChocolate GraphQL queries and mutation resolvers in C#.
- **FR-003**: Create React frontend profile and edit views matching a premium design theme.
