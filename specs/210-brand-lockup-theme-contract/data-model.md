# Data Model

La especificación no modifica EF Core ni datos persistidos de dominio.

## Estado frontend

| Campo | Tipo | Persistencia | Responsabilidad |
|---|---|---|---|
| `theme` | `light` o `dark` | `localStorage: oneitb-theme` | Preferencia explícita del usuario |
| `themeOverride` | `light`, `dark` o `null` | Memoria React | Excepción visual temporal de la superficie activa |
| `effectiveTheme` | derivado | No | `themeOverride ?? theme` |
| override stack | colección interna | No | Restauración segura de superficies anidadas |

El cleanup de cada registro elimina solo su propia identidad. No existe migración ni
sincronización con backend.
