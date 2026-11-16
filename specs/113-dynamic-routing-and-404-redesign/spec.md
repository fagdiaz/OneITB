# Spec: Dynamic Routing and 404 Redesign

## Objective
Solucionar el error de anidamiento de DOM en React, rediseñar por completo la página de Error 404 (NotFound) con Tailwind CSS v4, y habilitar el enrutamiento dinámico para que los usuarios puedan visitar perfiles públicos de terceros desde las publicaciones del Feed.

## Context
- **Error React (validateDOMNesting)**: La vista actual de error 404 o fallback contiene un `<h1>` anidado dentro de un `<p>`, lo cual rompe el DOM.
- **Error 404 de Perfil**: En el Feed, los enlaces a los perfiles apuntan a `/profile/{id}`, pero `Routing.jsx` no tiene definida la ruta con el parámetro dinámico `:id`, y `UserProfile.tsx` no está preparado para procesarlo, provocando un 404. Se requiere crear una página 404 profesional y adaptar el componente de perfil para soportar vistas de solo lectura.

## Requirements
1. **Fix Crítico**: Asegurarse de que ningún elemento de bloque (`<div>`, `<h1>`, `<h2>`) esté dentro de una etiqueta `<p>`.
2. **Diseño UI**: Utilizar Tailwind v4 para crear una página centrada, elegante e institucional (`bg-slate-50`, `text-slate-800`, `text-blue-600`).
3. **Actualización de Rutas**: Agregar ruta dinámica para los perfiles y `catch-all` para el 404.
4. **Adaptación de Perfil**: Soportar vistas de solo lectura de terceros usando `useParams`.
