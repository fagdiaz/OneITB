# Implementation Plan: Profile CV Print Styles

**Branch**: `147-profile-cv-print-styles` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)
**Input**: Corregir los estilos `@media print` del perfil público (UserProfile.tsx) para que el CV sea imprimible/exportable como PDF de forma legible.

## Summary

`UserProfile.tsx` usa un header con gradiente oscuro (`from-slate-950 via-blue-950 to-slate-900`) que al imprimir genera texto invisible (blanco sobre fondo negro). Además no existe ningún bloque `@media print` que colapse el layout, oculte controles de UI, muestre URLs textuales o limpie los fondos de color de las tarjetas. El fix consiste íntegramente en añadir clases utilitarias Tailwind con el prefijo `print:` en el componente existente.

## Technical Context

**Frontend**: React 18, Tailwind CSS 4, Vite 8
**Archivo afectado**: `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx` (585 líneas, solo JSX/Tailwind)
**Patrón**: Tailwind CSS provee la variante `print:` para `@media print` de forma nativa. Ej: `print:bg-white`, `print:hidden`, `print:text-black`.
**Sin migración**: No hay cambios de backend, GraphQL ni base de datos.
**Restricción**: No modificar archivos CSS globales; contener todo en `UserProfile.tsx`.

## Constitution Check

- **No shadow properties**: PASS (sin entidades nuevas).
- **GraphQL contract**: PASS (no afectado).
- **Frontend state consistency**: PASS (solo clases CSS, sin cambios de estado).
- **Documentation evidence**: PASS (roadmap, log y documentation status se actualizarán).

## Phase 1: Setup

Verificar que el build actual pasa antes de tocar el componente.

## Phase 2: Core — Aplicar clases print: en UserProfile.tsx

Puntos de intervención en `UserProfile.tsx`:

| Elemento | Problema | Fix Tailwind |
|---|---|---|
| Header section (líneas 181-221) | `bg-gradient-to-r from-slate-950` → negro sobre negro | `print:bg-white print:text-slate-950` en el div del header; `print:text-slate-950` en textos internos |
| Layout 2 columnas (líneas 246+) | `lg:grid-cols-[0.9fr_1.4fr]` → aside cortado | `print:block` o `print:grid-cols-1` en el wrapper del grid |
| Sección estadísticas (tarjetas 3 cols) | Fondos `bg-white shadow-sm` → pueden perder contraste | `print:shadow-none print:border print:border-slate-300` |
| Botones "Editar CV/Perfil" y "Editar CV" | Elementos de navegación | `print:hidden` en ambos `<Link>` |
| Botón "Ver todas / Ver menos" | Control de UI no imprimible | `print:hidden` |
| Link "Ver proyecto" de proyectos | La URL no es visible textualmente en print | Agregar `<span className="print:inline hidden text-xs text-slate-500">({item.url})</span>` |
| Sección "Estado académico personal" | Tiene fondo `bg-blue-50/60` con ring azul | `print:bg-white print:ring-0` |
| Sección "Portfolio social" (posts) | Puede paginar contenido de forma abrupta | `print:break-inside-avoid` en cada `<article>` |

## Phase 3: Validación

1. `npm.cmd run build` en `FrontEnd/OneItb-FE` — debe compilar sin errores.
2. Verificar manualmente en Chrome: Ctrl+P → Ver vista previa.

## Validation Plan

1. `npm.cmd run build` (Vite): PASS sin errores.
2. Vista previa de impresión en navegador: texto legible, botones ocultos, URLs visibles, layout de una columna.
