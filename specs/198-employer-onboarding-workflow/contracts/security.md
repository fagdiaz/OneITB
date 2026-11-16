# Security Contract

- Public request keys use HMAC-SHA256 fingerprints of normalized dimensions.
- No raw email/CUIT/token enters limiter keys or structured logs.
- Public conflict messages do not identify the conflicting record.
- Admin operations require JWT role and service-level actor validation.
- Role is server-owned and fixed to `Empleador`.
- Request contact data is not reachable through public GraphQL operations.
- Outbox payload is non-sensitive and Magic Link remains digest-only.
- Honeypot handling precedes normalization and returns generic acceptance without
  persistence.
- Public submission and Magic Link responses do not reveal account/request existence
  or SMTP delivery availability.
- Rejection reasons remain on the Admin-only request and are not copied into
  `AuditLog`; the audit records only whether a reason was supplied.
- Honeypot submissions return a generic accepted response without persistence.
- SMTP and SQL errors are mapped to stable safe codes.
