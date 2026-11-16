# Quickstart

Desde `FrontEnd/OneItb-FE`:

```powershell
npm.cmd run test -- --run src/context/ThemeContext.test.jsx src/Components/branding/BrandLockup.test.jsx src/Components/layout/private/Header.test.jsx src/Components/onboarding/AcademicOnboarding.test.jsx
npm.cmd run test -- --run
npm.cmd run build
```

Aceptación manual:

1. Guardar modo oscuro desde una ruta privada.
2. Abrir y recargar `/onboarding/academic`; debe verse claro.
3. Confirmar que el lockup visible es isotipo + `neITB`.
4. Salir del onboarding; debe volver el modo oscuro guardado.
5. Repetir Header, Landing, Hero y Footer entre 320 y 1440 px.
