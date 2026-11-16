# Plan de Implementación: Spec 228 - Extracción de Presentación en Feed (UserAvatar y Badges)

**ID:** PLAN-228  
**Fecha:** 2026-11-16  
**Estrategia:** Lotes Acotados y Secuenciales (Lotes A, B, C)  

---

## Fases de Ejecución

### Lote A: Creación de Componente Modular `UserAvatar.jsx`
- Ubicación: `FrontEnd/OneItb-FE/src/Components/publication/UserAvatar.jsx`.
- Extraer desde `Feed.jsx`:
  * `roleStyles`: Mapeo de estilos y etiquetas institucionales para los 6 roles.
  * `getRoleStyle(role)`: Función resolutora con fallback seguro.
  * `resolveAvatarUrl(user)`: Prefijador de URL relativa con `apiBaseUrl` y soporte data-url / absolute.
  * `getInitials(firstName, lastName)`: Formateador de iniciales (máximo 2 caracteres).
  * `getNameInitials(name)`: Formateador de iniciales por nombre completo.
  * `UserAvatar({ user, size })`: Componente visual con fallback de iniciales y rescate de error en carga de imagen.
  * `getParticipationBadges(user)`: Reglas de asignación de insignias por publicaciones (>=10), comentarios (>=20) y valoraciones (>=25).
  * `ParticipationBadges({ user })`: Componente visual de badges con accesibilidad y títulos descriptivos.

### Lote B: Creación de Suite de Pruebas Unitarias `UserAvatar.test.jsx`
- Ubicación: `FrontEnd/OneItb-FE/src/Components/publication/UserAvatar.test.jsx`.
- Casos de prueba:
  1. Renderizado de iniciales cuando `avatarUrl` es nulo o indefinido.
  2. Renderizado de `<img>` con `src`, `alt`, y clases correctas cuando existe `avatarUrl`.
  3. Transición a iniciales tras evento `onError` en la imagen del avatar.
  4. Insignias de participación: sin insignias para usuario nuevo, insignia 'Publicador' con 10 posts, 'Conversador' con 20 comentarios, 'Valorado' con 25 likes.
  5. Mapeo exhaustivo de `getRoleStyle` para los roles: `Administrador`, `Moderador`, `Profesor`, `Estudiante`, `Egresado`, `Empleador` y fallback para rol desconocido.

### Lote C: Integración en `Feed.jsx` y Validación de Regresión
- Limpiar en `Feed.jsx`:
  * Remover definiciones locales de `roleStyles`, `getRoleStyle`, `resolveAvatarUrl`, `failedAvatarUrls`, `getInitials`, `getNameInitials`, `UserAvatar`, `getParticipationBadges`, `ParticipationBadges`.
  * Importar las utilidades y componentes desde `./UserAvatar`.
- Validación:
  * Verificar compilación y tipos.
  * Ejecutar suite de pruebas de Vitest.
  * Ejecutar build de Vite.
