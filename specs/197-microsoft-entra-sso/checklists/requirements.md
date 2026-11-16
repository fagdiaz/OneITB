# Requirements Quality Checklist

- [x] Institutional tenant and domain boundaries are explicit
- [x] Access token versus ID token responsibility is explicit
- [x] Audience, issuer, signature, lifetime, tenant, subject and scope are required
- [x] Existing password and Magic Link flows are preserved
- [x] Role escalation from external claims is forbidden
- [x] External token persistence/logging is forbidden
- [x] Account-link conflicts and concurrent first login are covered
- [x] SSO-only local password behavior is covered
- [x] Logout/session isolation includes Apollo, WebSocket and MSAL
- [x] Configuration and operational ownership are documented
- [x] Runtime evidence cannot be inferred from compilation
