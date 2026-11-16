# Implementation Plan: UX & Print Polish

**Branch**: `150-ux-print-polish` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

## Summary

Cuatro fixes de UX/UI basados en la auditoría: (1) ocultar el Portfolio Social al imprimir el CV, (2) mejorar el fallback de imágenes rotas en el feed, (3) añadir botón de cierre explícito al hilo de comentarios expandido, (4) reemplazar contadores 0 en el perfil por "—" para mejor legibilidad.

## Technical Context

**Archivos afectados**:
| Archivo | Cambio |
|---|---|
| `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx` | FR-001 (print:hidden en Portfolio Social), FR-006 (métricas) |
| `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx` | FR-002, FR-003 (fallback imagen rota) |
| `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` | FR-005 (botón cerrar hilo comentarios) |

**Sin cambios de backend ni GraphQL.**

## Análisis de código

### FR-001 — Portfolio Social print:hidden
- `UserProfile.tsx` línea 641: `<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">`
- Añadir `print:hidden` a ese `<section>`.

### FR-002/FR-003 — Fallback imagen rota en MediaAttachment
- `MediaAttachment.jsx` línea 88-101: cuando `type === 'image' && !imageFailed` muestra imagen. Cuando `imageFailed` es true, cae al bloque de `fileStyles[type]` con el estilo de "image" (icon: fa-file-image), pero visualmente no está diferenciado de un documento.
- Agregar un bloque explícito de fallback cuando `type === 'image' && imageFailed` con mensaje "No se pudo cargar la imagen" + ícono `fa-image-slash` + enlace al archivo.

### FR-005 — Botón cerrar hilo de comentarios
- `Feed.jsx` línea 577-584: el botón "X comentarios" actúa como toggle de apertura pero no hay un control de cierre dentro del hilo.
- Añadir un botón "Cerrar comentarios" dentro del bloque `{threadOpen && ...}` (línea 603), encima del `<CommentThread>`, con `onClick={() => setOpenThreads(current => ({ ...current, [post.id]: false }))}`.

### FR-006 — Métricas 0 → "—"
- `UserProfile.tsx` líneas 318, 322, 326: usar `value || '—'` para mostrar guión cuando el valor es 0.
- `profile.totalPublications ?? userPosts.length` → `(profile.totalPublications ?? userPosts.length) || '—'`
- `careers.length` → `careers.length || '—'`
- `activitySubjects.length` → `activitySubjects.length || '—'`

## Validation Plan

1. `npm.cmd run build` — PASS sin errores TypeScript.
2. Verificar print en vista previa del navegador: Portfolio Social ausente.
3. Verificar fallback: cargar imagen con URL inválida → aparece fallback con ícono.
4. Verificar cierre: expandir comentarios → aparece botón "Cerrar comentarios".
5. Verificar métricas: perfil con 0 publicaciones → muestra "—".
