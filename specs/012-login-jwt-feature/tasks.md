# Tasks: Refactor and Clean Up Login/JWT (CU-04)

**Input**: Design documents from `/specs/012-login-jwt-feature/`

## Phase 1: Implementation
- [x] T001 Implement actual JWT signing in `AccountsService.cs` using `Jwt:Key` and `Jwt:Issuer` from `IConfiguration`.
- [x] T002 Replace placeholder token with generated JWT in `AccountsService.cs`.
- [x] T003 Rebuild the solution and verify clean compilation.

## Phase 2: QA Check
- [x] T004 Run `$speckit-qa` checks to ensure English variable mapping and HotChocolate schema consistency.
