# Tasks: Quick Wins UI Polish (100)

## Phase 1: Encoding y Fechas

- [x] T1.1: Fix Encoding. Recodificar `DbInitializer.cs` en formato UTF-8 puro para solucionar caracteres "" (eñes y tildes).
- [x] T1.2: Fix Formato de hora en publicaciones. Refactorizar la función de fecha en `Feed.jsx` para mostrar únicamente "HH:mm".
- [x] T1.3: Fix Formato de hora en comentarios. Refactorizar la función de fecha en `CommentThread.jsx`.

## Phase 2: Funcionalidad Social Faltante

- [x] T2.1: Modificar `CommentNode` en `CommentThread.jsx` para incluir un botón "Reportar".
- [x] T2.2: Modificar la firma del componente `CommentThread` para recibir y propagar la función `onReport`.
- [x] T2.3: Actualizar `Feed.jsx` para vincular el `ReportModal` a la acción de reportar comentarios.

## Phase 3: Pulido Administrativo

- [x] T3.1: Añadir botón explícito "Suspender/Activar" en la tabla de `UserManagement.jsx`.
- [x] T3.2: Refactorizar `SubjectManagement.jsx` eliminando las tarjetas y adaptando el listado al formato de `<table className="w-full...">` usado en los demás componentes.
- [x] T3.3: Refactorizar `ModerationManagement.jsx` aplicando la misma estructura tabular.
