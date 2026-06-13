# Implementation Plan: Quick Wins UI Polish (100)

## 1. Fix Encoding (Caracteres Especiales)
- Archivo: `DbInitializer.cs`
- El archivo actual puede tener un BOM o formato distinto a UTF-8. Se volverá a guardar con codificación UTF-8, o se modificará cómo se devuelven los strings en caso de ser necesario. Sin embargo, en .NET Core el framework usa UTF-8. Lo más seguro es asegurarse de que los strings y el archivo de código fuente estén en UTF-8 y se pasen adecuadamente por EF Core. 
- *Actualización:* Re-codificar el archivo `API Graphql/Data/DbInitializer.cs` asegurando UTF-8 (esto se puede hacer reemplazando su contenido y forzando UTF-8 por CLI si corresponde, o simplemente editando el contenido).

## 2. Fix Formato de Hora
- Archivo `Feed.jsx`: Modificar `{new Date(post.publishDate).toLocaleString()}` a `{new Date(post.publishDate).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` o usar opciones similares para remover los segundos.
- Archivo `CommentThread.jsx`: Aplicar la misma modificación para las fechas de los comentarios.

## 3. Reportar Comentarios
- Archivo `CommentThread.jsx`: Añadir botón "Reportar" en cada comentario y propagar evento o manejar la mutación de moderación localmente.
- Archivo `Feed.jsx`: Actualizar pasaje de props si el reporte se eleva o permitir usar el `ReportModal` con identificadores de comentarios en lugar de sólo de publicaciones.

## 4. Botón de Desactivar/Suspender Usuario
- Archivo `UserManagement.jsx` o `AdminDashboard.jsx`: Añadir un botón o modificar el toggle para despachar la mutación `updateUserStatus`.

## 5. Consistencia Visual
- Archivo `SubjectManagement.jsx`: Transformar las tarjetas a un diseño de tabla (`table` con Tailwind) similar a `UserManagement.jsx`.
- Archivo `ModerationManagement.jsx`: Transformar su vista también a tabla tabular consistente.
