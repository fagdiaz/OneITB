# Feature Specification: Mini Chat Widget

## Description
Transformar el actual acceso directo al chat (botón flotante) de `PrivateLayout.jsx` en un "Mini Chat Widget" interactivo en la esquina inferior derecha. Esto permite a los usuarios chatear y revisar sus conversaciones activas sin perder su contexto actual de navegación.

## Functional Requirements
1. El widget debe estar minimizado por defecto, mostrando un icono de chat.
2. Al hacer clic en el widget, este se expande para mostrar la lista de contactos o mensajes de una conversación, superponiéndose al contenido sin alterar el layout principal de la aplicación.
3. El widget debe mantener el estado de la conversación y de GraphQL WebSockets mientras el usuario navega por distintas rutas del `PrivateLayout`.
4. El sistema actual de `PrivateChat.jsx` o su lógica GraphQL de `chat.js` debe migrarse / reutilizarse para que este widget tenga soporte de "Conversaciones activas" e "Historial".
5. Debe incluir un botón para cerrar o minimizar el panel de chat.

## Success Criteria
- Los usuarios pueden enviar y recibir mensajes desde el feed u otras páginas sin recargar.
- La navegación en la aplicación no interrumpe una conversación abierta en el mini widget.
- El chat se contrae en una burbuja limpia, ocupando espacio mínimo en pantalla al estar cerrado.

## User Scenarios & Testing
1. **Acceso al chat**: El usuario navega en el feed, ve un indicador visual de chat en la esquina, hace clic y se abre su lista de contactos.
2. **Chateo en contexto**: El usuario abre un contacto, lee mensajes y escribe una respuesta sin salir del feed. Envía el mensaje y lo visualiza inmediatamente.
3. **Persistencia**: El usuario navega hacia el panel de "Materias" mientras el chat está expandido. El chat sigue expandido y la conversación no se interrumpe ni pierde sus datos cargados.
