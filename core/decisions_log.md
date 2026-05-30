# Architectural Decisions Log: OneITB23

**Active Status**: Fully Ratified under Constitution v1.0.0

## AD-001: BCrypt Password Hashing
- **Decision**: All user passwords must be hashed using BCrypt.
- **Data Representation**: Storage is allocated physically using exactly `char(60)` in SQL Server.
- **Vulnerability Mitigated**: Plain-text credential leakage.
- **Resolved Date**: 2026-05-30

## AD-002: Regular Expression Denial of Service (ReDoS) Prevention
- **Decision**: Email regex validation must be pre-compiled and run with a strict execution timeout.
- **Constraints**: Regex timeout is set to exactly 250 milliseconds (`TimeSpan.FromMilliseconds(250)`).
- **Vulnerability Mitigated**: CPU exhaustion attacks via malformed validation inputs.
- **Resolved Date**: 2026-05-30

## AD-003: GraphQL Sensitive Field Exclusions
- **Decision**: Avoid exposing sensitive EF entity properties directly via the HotChocolate engine.
- **Implementation**: Ignored using the `[GraphQLIgnore]` attribute on the physical `Password` field.
- **Vulnerability Mitigated**: Inadvertent security exposure through GraphQL queries.
- **Resolved Date**: 2026-05-30

## AD-004: Relational Cascade Prevention
- **Decision**: Key relationship deletes (such as User -> Consultas) must not cascade automatically.
- **Implementation**: Set `DeleteBehavior.Restrict` via EF Core Fluent API.
- **Vulnerability Mitigated**: Unintentional cascading transactional records deletion.
- **Resolved Date**: 2026-05-30

## AD-005: Security Pipeline Ordering
- **Decision**: Register `app.UseAuthentication()` before `app.UseAuthorization()` in the HTTP pipeline.
- **Implementation**: Enables validation of JWT lifespans with active validation checks.
- **Vulnerability Mitigated**: Bypassed authorized endpoint restrictions.
- **Resolved Date**: 2026-05-30
