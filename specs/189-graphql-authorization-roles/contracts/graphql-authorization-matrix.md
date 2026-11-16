# Contract: GraphQL Mutation Authorization Matrix

## Public Entry Points

| Mutation | Declarative gate | Contextual validation |
|---|---|---|
| registerUser | Public | Registration role/domain/career validation |
| login | Public | Password, active status and account lockout |
| requestMagicLink | Public | Generic response and employer onboarding validation |
| loginWithMagicLink | Public | One-time credential validation |

## Protected Categories

| Category | Declarative gate | Contextual gate |
|---|---|---|
| Profile/self/social/chat/notification | Authenticated | Current user, target, block/ownership/state |
| User and subject administration | Administrador | Input and protected-admin rules |
| Moderation | Administrador or Moderador | Target state, reason and audit record |
| Academic writes | Approved Admin/Professor or scoped policy | Subject/career/uploader/learner scope |
| Create job offer | Empleador or Administrador | Active actor and input |
| Apply to job | Estudiante or Egresado | Active offer, uniqueness and self |
| Update application status | Empleador or Administrador | JobOffer.EmployerId equals actor unless approved admin override |

## Denial Contract

- Anonymous: HotChocolate authentication error code; resolver not invoked.
- Wrong role: authorization error code; resolver not invoked.
- Correct role but wrong owner/scope: stable USER_ERROR or domain authorization code from service.
- No denial response exposes row content, email, CV or existence beyond the approved message.

## Compatibility

- Operation names, GraphQL arguments and success payloads remain unchanged.
- Frontend visibility checks remain UX only.
- Existing owner/author/moderator service checks remain unless tests prove exact redundancy.

## Verification

For every category execute anonymous, wrong-role, allowed-role and allowed-role/wrong-owner cases against the real HotChocolate executor.
