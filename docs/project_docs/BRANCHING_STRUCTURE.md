# Estructura y Gobernanza de Ramas Git - OneITB23

**Fecha de Normalización:** 2026-11-01  
**Estado:** Release Candidate Académico (117/117 Alcance Completo)  
**Repositorio Oficial:** `https://github.com/fagdiaz/OneITB.git`

---

## 1. Rama Principal Activa ("Semi-Main" / Release Candidate)

| Rama Canónica | Equivalente Técnico | Propósito |
| :--- | :--- | :--- |
| **`release/candidate-2026`** | Rama Oficial de Release | **Punto de entrada oficial y visible en GitHub.** Contiene todo el código estabilizado, probado y verificado (234 tests backend + 258 frontend). |
| **`codex/199-ux-b2b-academic-onboarding`** | Rama de Integración Interna | Rama técnica utilizada para las integraciones continuas y sincronización entre agentes. Es idéntica en contenido a `release/candidate-2026`. |

> [!IMPORTANT]
> La rama histórica `main` quedó desactualizada respecto a las últimas 15 especificaciones. La verdadera rama de producción académica para clonar o inspeccionar es **`release/candidate-2026`** (o `codex/199-ux-b2b-academic-onboarding`).

---

## 2. Tags Canónicos con Fechas (Hitos Históricos)

Para evitar la proliferación de ramas muertas en GitHub, los hitos clave están grabados mediante Git Tags inmutables:

* **`v1.0.0-rc.1-2026-10-31`**: Release Candidate oficial consolidado tras el preflight de 8 compuertas (`speckit-stabilize`).
* **`hpt-2026-10-30-multi-agent-merge`**: Hito de integración distribuida (PC + Notebook Dell).
* **`hpt-2026-08-08-feature-complete`**: Alcance funcional 117/117 completado (cierre Spec 198).

---

## 3. Depuración de Ramas Efímeras

Se han eliminado de `origin` (GitHub) las ramas temporales que ya fueron 100% integradas y verificadas:
- `feature/mod-admin-academic` ➔ *Fusionada en `1b1c00e` (Eliminada)*
- `feature/mod-chat-refactor` ➔ *Fusionada en `6104378` (Eliminada)*
- `feature/mod-jobs-hardening` ➔ *Fusionada en `1b1c00e` (Eliminada)*
- `feature/ui-academic-admin-hardening` ➔ *Fusionada en `f13819d` (Eliminada)*
- `feature/ui-auth-profile-hardening` ➔ *Fusionada en `f13819d` (Eliminada)*
- `sync/notebook-transfer` ➔ *Transferencia temporal (Eliminada)*

---

## 4. Convención de Nombres para Futuras Ramas

Cuando un agente o desarrollador deba implementar un arreglo o módulo:

```text
feature/<año>-<mes>-<dia>-<modulo>
```
*Ejemplo:* `feature/2026-11-01-debugger-cv-builder`

1. **Base de despegue:** Se crea siempre a partir de `release/candidate-2026` o `codex/199-ux-b2b-academic-onboarding`.
2. **Ciclo de vida:** Tras ser aprobada y mergeada sin conflictos, la rama remota se elimina para mantener limpio el árbol de GitHub.
