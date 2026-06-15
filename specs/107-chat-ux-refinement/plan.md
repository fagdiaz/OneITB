# Implementation Plan: Chat UX Refinement

## Architectural Design
Se aplicarán mejoras a nivel de interfaz de usuario (`React.js`) y manejo de caché con `Apollo Client` para agilizar las transiciones y validaciones del chat privado. No se requieren cambios en el Backend.

## Component Design
1. **Limpieza del Buscador**: 
   - Archivo: `PrivateChat.jsx`
   - Función: `handleSelectContact`
   - Cambio: Invocar `setSearchTerm('')` cuando se ejecuta la función.

2. **Reactividad del Sidebar**:
   - Archivo: `PrivateChat.jsx`
   - Funciones: `handleSubmit` y `useSubscription(MESSAGE_RECEIVED)`
   - Cambio: Validar si el otro usuario no existe en `activeData.activeConversations.nodes`. De ser así, invocar `refetchActive()` para actualizar la lista.

3. **Control de teclado en Textarea**:
   - Archivo: `PrivateChat.jsx`
   - Componente: `<textarea>`
   - Cambio: Agregar la propiedad `onKeyDown` capturando `Enter` sin modificadores para disparar el submit del formulario (previniendo el salto de línea por defecto).

## Security & Privacy
No se modifican políticas de datos. Las peticiones de la caché de Apollo están bajo el JWT seguro de GraphQL.
