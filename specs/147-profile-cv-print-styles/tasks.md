# Tasks: Profile CV Print Styles

## Phase 1: Setup

- [X] T001 Verificar que el build base pasa antes de modificar UserProfile.tsx

## Phase 2: Core — Aplicar clases print: en UserProfile.tsx

- [X] T002 [P] Header section: reemplazar fondo oscuro por blanco en print (`print:bg-white`, `print:text-slate-950`)
- [X] T003 [P] Layout: colapsar grid de 2 columnas a 1 columna en print (`print:block` o `print:grid-cols-1`)
- [X] T004 [P] Ocultar botones de edición y navegación en print (`print:hidden` en ambos Links de edición y botón "Ver todas")
- [X] T005 [P] Mostrar URL textual de proyectos en print (agregar `<span className="hidden print:inline">`)
- [X] T006 [P] Limpiar fondos de color y sombras de secciones/tarjetas en print
- [X] T007 [P] Aplicar `print:break-inside-avoid` en artículos de publicaciones para evitar cortes
- [X] T012 [P] Redes sociales: mostrar URL completa visible junto al nombre de la red (FR-008)
- [X] T013 [P] Botón "Imprimir/Guardar CV" en header del perfil, `print:hidden` (FR-009)
- [X] T014 [P] Ocultar rol "User" genérico en cabecera del CV (FR-010)
- [X] T015 MiniChatWidget: añadir `print:hidden` en PrivateLayout.jsx (FR-011)
- [X] T016 [P] Fix blank page: `print:m-0 print:p-0` en contenedor raíz + eliminar `min-h-full` en print (FR-012)

## Phase 3: Validación y Documentación

- [X] T008 Run frontend build (`npm.cmd run build`)
- [X] T009 Actualizar `docs/audit/DEVELOPMENT_LOG.md`
- [X] T010 Actualizar `docs/project_docs/ROADMAP.md`
- [X] T011 Actualizar `docs/audit/DOCUMENTATION_STATUS.md`
