# Implementation Plan: docs-governance

**Branch**: `003-docs-governance` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-docs-governance/spec.md`

## Summary

Estructuración modular de la documentación académica basada en las 3 funcionalidades core de la plataforma (Identidad, Muro y Mensajería) en `/docs/academic/` y la optimización de los archivos de gobernanza en `/core-web/` para máxima eficiencia de tokens de modelos LLM (Gemini Web).

## Technical Context

**Language/Version**: Markdown, Mermaid para diagramas.

**Storage**: Archivos planos (.md) persistidos en el repositorio.

**Testing**: Inspección visual de formato de tablas, markdown y compatibilidad de sintaxis Mermaid.

**Project Type**: Documentación y Gobernanza.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Seguridad**: Se mantienen íntegras las directivas constitucionales sobre contraseñas (BCrypt), ReDoS (timeout de 250ms) y JWT en `system.md` y `decisions_log.md`.
- **Gobernanza**: Las reglas de specify y compatibilidad de agentes se preservan intactas en `agent_contracts.md`.

## Project Structure

### Documentation (this feature)

```text
specs/003-docs-governance/
├── plan.md              # This file
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Task list
```

### Affected Files

```text
core-web/
├── system.md
├── agent_contracts.md
└── decisions_log.md

docs/
├── academic/
│   ├── 01_Presentacion_General.md
│   ├── 02_Requerimientos.md
│   ├── 03_Casos_De_Uso.md
│   └── 04_Diagramas.md
└── audit/
    ├── DOCUMENTATION_STATUS.md
    └── DEVELOPMENT_LOG.md
```
