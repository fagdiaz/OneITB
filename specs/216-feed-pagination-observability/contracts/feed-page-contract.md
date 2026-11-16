# Contract: Inquiry Page

## Backend

- Entrada: `first` entre 1 y 25, cursor opaco y filtros inmutables.
- Salida: `items`, `totalCount`, `hasNextPage` y `nextCursor`.
- `nextCursor` solo existe cuando `hasNextPage=true`; una página terminal devuelve cadena vacía.
- El orden permanece estable dentro del alcance de actor, carrera, materia, búsqueda y autor.

## Frontend

`loadMore()` devuelve `appended`, `end`, `busy`, `stale` o `error`. Un error conserva
los elementos visibles y habilita reintento. El cambio de filtros reinicia el estado.
Apollo separa entradas por búsqueda, carrera(s), materia(s), publicación y autor; `first`
y `after` no crean conjuntos filtrados incompatibles.
