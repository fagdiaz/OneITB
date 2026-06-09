# Implementation Plan: Refactor and Clean Up Login/JWT (CU-04)

**Branch**: `012-login-jwt-feature` | **Date**: 2026-06-09 | **Spec**: [spec.md](file:///F:/React/OneITB23/specs/012-login-jwt-feature/spec.md)

## Summary
Audit codebase for Spanish and obsolete login/JWT code (done: none found). Replace `token_generado_aqui` placeholder in `AccountsService.cs` with cryptographic JWT token generation using `System.IdentityModel.Tokens.Jwt`.

## Audit Analysis
- **Obsolescence**: No old Spanish methods (`IniciarSesion`) or redundant DTOs exist in the backend.
- **Current State**: The backend uses clean English classes and interfaces (`IAccountService.cs` and `AccountsService.cs`), but the token returned was a static string placeholder.
- **Target Design**: Cryptographically sign JWTs using HS256 with key and issuer from appsettings.json.
