# Research: Feed Pagination Observability

## Hallazgos

- El servicio ya tenía límite 25, orden estable, `CountAsync`, `Skip/Take(pageSize + 1)`,
  cursor opaco y cancelación.
- Los bordes 0, 1, 15 y 16 confirmaron que no anunciaba páginas inexistentes.
- El Feed duplicaba la lógica del hook compartido y no distinguía error de página.
- Los `keyArgs` eran correctos, pero no existía una regresión de aislamiento por carrera.

## Decisión

No se modifica el backend productivo. El Feed consume el hook canónico. El hook normaliza
filtros, bloquea dobles clics, ignora respuestas obsoletas para la UI, deduplica por ID y
conserva la lista previa ante error.
