# Implementation Plan: Feed Pagination Observability

## Technical Context

`inquiriesPage` es cursor-based y está limitado a 25. La implementación consolida los
consumidores React sobre `useInquiryPage`, agrega regresión backend/frontend y diferencia
carga inicial, página siguiente, error recuperable y fin. No requiere migración EF.

## Design

1. Auditar `hasNextPage/nextCursor` sin modificarlo si los bordes son correctos.
2. Consolidar el Feed sobre `useInquiryPage` y retirar la paginación manual duplicada.
3. Hacer que `loadMore` devuelva un resultado observable.
4. Normalizar filtros, aislar caché y descartar resultados obsoletos para la UI.
5. Conservar resultados en fallo y mostrar reintento/fin en los consumidores.

## Primary Files

- `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`
- `FrontEnd/OneItb-FE/src/hooks/useInquiryPage.js`
- `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- `FrontEnd/OneItb-FE/src/Components/publication/FeedPaginationControls.jsx`
- `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.test.js`

## Constitution Check

Consulta acotada, async y cancelable; sin cambio de schema o EF. Apollo mantiene
separación por filtros y frontera de sesión. La UI conserva loading, empty, error,
retry y terminal. El smoke browser es obligatorio para promover `[I]` a `[V]`.
