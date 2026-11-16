# Especificación: Spec 228 - Extracción de Presentación en Feed (UserAvatar y Badges)

**ID:** SPEC-228  
**Fecha:** 2026-11-16  
**Área:** Frontend (`FrontEnd/OneItb-FE`)  
**Tipo:** Refactorización de Presentación Acotada (Post-Freeze Controlado)  
**Estado:** PLANIFICADA  

---

## 1. Contexto y Justificación

La auditoría de organización (`AUDITORIA_ORGANIZACION.md`, §6) identificó que `Feed.jsx` (~1255 líneas) centraliza múltiples responsabilidades. Aunque ya delega comentarios a `CommentThread.jsx`, adjuntos a `AttachmentDraftPicker.jsx` y paginación a `FeedPaginationControls.jsx`, aún conserva lógica pura de maquetación y formateo de avatares de usuario, insignias de participación comunitaria y estilos de rol institucionales.

Siguiendo el mandato de "aislar una responsabilidad adicional pequeña, con props claras, sin tocar a la vez Apollo, permisos, uploads y modales", esta especificación desacopla la presentación de identidad de usuario (`UserAvatar`, `ParticipationBadges`, `getRoleStyle`, `resolveAvatarUrl`, `getNameInitials`) en un módulo atómico e independiente.

---

## 2. Invariantes Arquitectónicos

1. **Cero Alteración de Contratos Apollo:** No se modifican operaciones GraphQL, variables, políticas de fetch (`cache-and-network`), fragmentos ni la función `updateReactionCache`.
2. **Cero Alteración de Flujos de Red o Subida:** La lógica de subida multipart `/api/upload`, tokens de autenticación y modales de moderación permanecen intactos en `Feed.jsx`.
3. **Preservación Estricta de Clases Visuales y Dark Mode:**
   - Paleta Clean Tech y Tech Noir intacta (`text-indigo-700 dark:text-indigo-200`, etc.).
   - Atributos de accesibilidad (`aria-label`, `alt`, `loading="lazy"`, `decoding="async"`).
   - Manejo de fallos en avatares rotos (`failedAvatarUrls` Set en memoria).
4. **Retrocompatibilidad 100%:** Todas las funciones auxiliares exportadas mantienen sus firmas y valores por defecto.

---

## 3. Alcance de la Modificación

### Archivos Afectados
- `FrontEnd/OneItb-FE/src/Components/publication/UserAvatar.jsx`: Nuevo componente modular con `UserAvatar`, `ParticipationBadges`, `getRoleStyle`, `resolveAvatarUrl`, `getNameInitials`, `getInitials`, `roleStyles`.
- `FrontEnd/OneItb-FE/src/Components/publication/UserAvatar.test.jsx`: Nueva suite de pruebas unitarias para validar renderizado de avatares, iniciales, errores de carga, insignias por métricas y estilos de roles.
- `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`: Sustitución de declaraciones locales por imports limpios desde `./UserAvatar`.

---

## 4. Criterios de Aceptación (DoD)

1. `Feed.jsx` reduce ~110 líneas de lógica auxiliar de renderizado.
2. Todas las rutas (`/feed`, `/post/:id`) visualizan los avatares, insignias y badges de rol exactamente igual que en el candidato `37ed360`.
3. Las pruebas unitarias de `UserAvatar.test.jsx` pasan al 100%.
4. No hay regresiones en la suite de pruebas del frontend (`npm run test -- --run`).
5. La compilación de producción (`npm run build`) finaliza exitosamente con cero advertencias de ESLint/oxlint.
