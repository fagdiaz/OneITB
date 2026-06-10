# Specification: Global Docs Sync (047)

## Feature Description
Sincronizar y actualizar la documentación técnica global del proyecto (Roadmap, Reporte de Auditoría Frontend y Especificación del Sistema) para reflejar con exactitud los hitos arquitectónicos alcanzados.

## Architecture
- `system.md`: Update backend stack from .NET 6 to .NET 8 LTS and include Tailwind CSS v4 in the frontend stack.
- `FRONTEND_AUDIT_REPORT.md`: Update components status (`Feed`, `SideBar`, `UserProfile`) and remove legacy CSS grid diagnostics.
- `ROADMAP.md`: Update task T2.4 status and add a note about the extra Employer Passwordless and Community Moderation features.

## Edge Cases
- Ensure tabular formatting in Markdown is preserved.
- Only `.md` files should be modified.
