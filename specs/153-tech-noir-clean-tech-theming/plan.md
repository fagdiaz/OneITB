# Plan: Spec 153 - Tech Noir & Clean Tech Theming System

## Technical Approach

1. **Tailwind v4 dark variant**
   - Registrar `@custom-variant dark (&:where(.dark, .dark *));` en `index.css`.
   - Mantener el `body` con base Clean Tech y variante Tech Noir.

2. **FOUC prevention**
   - Agregar script inline temprano en `index.html`.
   - Resolver tema desde `localStorage` o `prefers-color-scheme` antes de montar React.

3. **React state**
   - Crear `ThemeContext.jsx`.
   - Exponer `theme`, `setTheme`, `toggleTheme` e `isDark`.
   - Aplicar clase `dark` y `color-scheme` a `document.documentElement`.

4. **Header UX**
   - Integrar `useTheme` en `Nav.jsx`.
   - Agregar switch elegante dentro del dropdown de usuario, antes de "Salir".

5. **UI conversion**
   - Convertir las superficies principales desde estilo fijo a `light + dark:`.
   - Priorizar componentes routeados reales y usados actualmente.

## Files

- `FrontEnd/OneItb-FE/index.html`
- `FrontEnd/OneItb-FE/src/index.css`
- `FrontEnd/OneItb-FE/src/main.jsx`
- `FrontEnd/OneItb-FE/src/context/ThemeContext.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
- `FrontEnd/OneItb-FE/src/Components/chat/*.jsx`
- `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
- `FrontEnd/OneItb-FE/src/Components/moderation/ReportModal.jsx`

## Validation

- Frontend build: `npm.cmd run build` from `FrontEnd/OneItb-FE`.
- Manual verification recommended: toggle persistence, browser refresh, print preview in `/profile`.
