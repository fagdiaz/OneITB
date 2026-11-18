# Tareas de Implementación: Spec 228 - Extracción de Presentación en Feed (UserAvatar y Badges)

- [x] **Lote A: Creación de Componente Modular `UserAvatar.jsx`**
  - [x] Crear `FrontEnd/OneItb-FE/src/Components/publication/UserAvatar.jsx`.
  - [x] Exportar `UserAvatar`, `ParticipationBadges`, `getRoleStyle`, `roleStyles`, `resolveAvatarUrl`, `getNameInitials`, `getInitials`, `getParticipationBadges`.
  - [x] Preservar 100% de clases Tailwind, accesibilidad y lógica de cache de errores (`failedAvatarUrls`).

- [x] **Lote B: Creación de Pruebas Unitarias `UserAvatar.test.jsx`**
  - [x] Crear `FrontEnd/OneItb-FE/src/Components/publication/UserAvatar.test.jsx`.
  - [x] Cubrir renderizado de iniciales, carga de imagen, recuperación ante error, insignias por métricas y estilos de roles (18 casos ejecutados mediante 12 pruebas simples + 1 `it.each` parametrizado con 6 roles; 24/24 PASS junto a Feed.interactions).

- [x] **Lote C: Integración en `Feed.jsx` y Verificación**
  - [x] Actualizar `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` importando desde `./UserAvatar`.
  - [x] Remover código redundante en `Feed.jsx`.
  - [ ] Puntero canónico `.specify/feature.json`: Se conservó en `specs/220-core-closure-and-application-hardening` por excepción procedimental de gobernanza (Specs 221-228 ejecutadas como sub-lotes de mantenimiento de tooling y presentación bajo la estabilización del Release Candidate, sin desviar el puntero canónico de la spec 220).
  - [x] Registrar evidencia en `specs/228-feed-presentation-extraction/EVIDENCE.md`.
  - [x] Documentar en `docs/audit/DEVELOPMENT_LOG.md`.
