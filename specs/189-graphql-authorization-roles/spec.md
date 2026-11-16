# Feature Specification: Declarative GraphQL Mutation Authorization

**Feature Directory**: specs/189-graphql-authorization-roles  
**Created**: 2026-07-22  
**Status**: Verified  
**Audit Source**: docs/audit/FINAL_AUDIT_REPORT.md (critical authorization finding)

## Problem Statement

Most Mutation.cs operations already use HotChocolate Authorize attributes, but protection is not demonstrated by a complete authorization matrix. Several role-limited operations still expose only a broad authenticated attribute and depend on imperative service checks. Declarative role gates must reject invalid principals before resolver execution while ownership and resource-scope rules remain enforced in services.

## User Scenarios & Testing

### User Story 1 - Anonymous users reach only authentication entry points (Priority: P0)

An unauthenticated caller can register/login/request or redeem a magic link, but every state-changing business mutation is rejected before resolver execution.

**Independent Test**: Enumerate Mutation fields through the real HotChocolate executor, call each protected category anonymously and assert authorization code plus zero side effects.

### User Story 2 - Role-restricted operations fail before execution (Priority: P0)

Students cannot administer users/subjects, employers cannot moderate content and unauthorized roles cannot invoke academic or job-management operations.

### User Story 3 - Ownership remains enforced (Priority: P0)

A caller with an allowed role still cannot edit another user's content, update another employer's application or access a resource outside allowed ownership/scope.

### User Story 4 - Authorized workflows remain functional (Priority: P1)

Admin, Moderator, Professor, Employer, Student and Graduate principals retain exactly the actions granted by the institutional role matrix.

## Functional Requirements

- **FR-001**: Every Mutation field MUST be classified in a versioned authorization matrix as anonymous, authenticated, role-restricted or authenticated-plus-ownership.
- **FR-002**: All non-public mutations MUST declare HotChocolate Authorize at resolver/type extension level.
- **FR-003**: Role-exclusive mutations MUST declare canonical role arrays or named ASP.NET authorization policies.
- **FR-004**: Public authentication mutations MUST be explicitly documented and contain no ambient-authority assumption.
- **FR-005**: Ownership, career enrollment, author identity and offer ownership MUST remain service-level checks; declarative roles MUST NOT replace them.
- **FR-006**: Resolver bodies MUST not be reached when authentication/role middleware rejects a request.
- **FR-007**: Role names MUST match JWT claims exactly: Administrador, Moderador, Profesor, Estudiante, Egresado and Empleador.
- **FR-008**: Job mutations MUST apply declarative role gates: create offers for Empleador/Administrador; apply for Estudiante/Egresado; update status for Empleador/Administrador plus offer ownership.
- **FR-009**: Administrative user/subject/SIU operations MUST be Administrador-only; moderation operations MUST allow only Administrador/Moderador.
- **FR-010**: Academic write operations MUST follow the existing approved role contract and preserve subject/career ownership rules.
- **FR-011**: Error responses MUST use sanitized authorization codes and reveal no protected resource details.
- **FR-012**: The frontend MAY hide unavailable actions but backend attributes and service checks remain authoritative.

## Initial Matrix Categories

| Category | Examples | Gate |
|---|---|---|
| Public auth | RegisterUserAsync, Login, RequestMagicLink, LoginWithMagicLink | Anonymous by design |
| Authenticated self/social | UpdateProfile, reactions, follow, messages, notification read | Authorize plus ownership where relevant |
| Administration | UpdateUserRole/Status, subject management, SyncSiuGrades | Administrador |
| Moderation | SilenceUser, report status, hide content | Administrador or Moderador |
| Academic writes | resource/progress mutations | Approved Professor/Admin or scoped authenticated policy |
| Employment | create/apply/status update | Role gate plus ownership |

## Edge Cases

- JWT is valid but role claim is missing, misspelled or wrong casing.
- Admin is permitted by role but target ownership rule still prohibits a protected action.
- A resolver supports author OR moderator; broad Authorize remains and service evaluates resource context.
- Multiple role attributes accidentally produce AND instead of intended OR behavior.
- WebSocket-authenticated mutations use the same claims mapping as HTTP.

## Success Criteria

- **SC-001**: Matrix covers 100% of public Mutation fields.
- **SC-002**: Integration tests cover anonymous, wrong-role, allowed-role and ownership-denied cases for each category.
- **SC-003**: Rejected requests produce zero database/event/email side effects.
- **SC-004**: Runtime schema operations confirm middleware rejection codes and valid flows.
- **SC-005**: Backend tests and Release build pass with no new warnings.

## Out of Scope

- Replacing JWT with another identity provider.
- Encoding row ownership entirely in declarative role attributes.
- Frontend-only authorization as a security control.
