# Contract: Institutional Enrollment Provider

Entrada: identidad institucional validada (`tenant`, `subject`, email normalizado).

Salida: estado de verificación, carrera única, materias vigentes, fuente y timestamp UTC.

Modos:
- `SelfDeclared`: confirmación local visible y auditable.
- `Institutional`: requiere endpoint, autenticación y contrato aprobados; falla cerrado.

