# Estructura y Gobernanza de Ramas Git - OneITB23

**Fecha de Normalización:** 2026-11-01  
**Estado:** Release Candidate Académico (117/117 Alcance Completo)  
**Repositorio Oficial:** `https://github.com/fagdiaz/OneITB.git`

---

## 1. Referencias para reproducir el corte

| Referencia observada el 2026-11-09 | SHA completo | Uso |
| --- | --- | --- |
| `origin/feature/2026-11-01-debugger-cv-builder` | `d8e45c2c49da801a076fab1d6e3a6245ce086be3` | Rama de integración; contiene GOB-12 y la matriz GOB-13. Base auditada de GOB-14. |
| `origin/release/candidate-2026` | `2292985dab194e1beab4da283ca1d5d901e7b517` | Referencia nominal de RC. La rama local histórica `codex/199-ux-b2b-academic-onboarding` apunta al mismo commit en este inventario. |
| Corte de autoría del paquete de defensa | `62338cbd60766cf5cbe48b505cf06f57daa32a5e` | Identifica las métricas impresas en la presentación y el guion (§4 de DOCUMENTATION_STATUS.md). |
| SHA definitivo para la mesa | Pendiente de CF-06 | Registrar el SHA completo y la evidencia del corte integrado cuando se cumplan los gates del roadmap. |

Para inspeccionar GOB-14 desde una **copia nueva**:

```powershell
git clone --no-checkout https://github.com/fagdiaz/OneITB.git OneITB23-revision
git -C OneITB23-revision switch --detach d8e45c2c49da801a076fab1d6e3a6245ce086be3
git -C OneITB23-revision rev-parse HEAD
```

La última salida debe coincidir con el SHA completo de la primera fila. Para una
defensa posterior se sustituye ese valor por el SHA del manifiesto CF-06.
Las ramas pueden avanzar. La mesa prevista para el 07/08/2026 no se realizó y no
hay fecha de reemplazo documentada.

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

1. **Base de despegue:** Partir del SHA de integración acordado para la spec y verificarlo con `git rev-parse` antes de crear la rama.
2. **Ciclo de vida:** Tras ser aprobada y mergeada sin conflictos, la rama remota se elimina para mantener limpio el árbol de GitHub.
