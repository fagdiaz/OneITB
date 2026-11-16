# Plan: Brand Lockup and Theme Contract

**Risk:** MEDIUM.

Implementar el wordmark corregido en `BrandLockup`, agregar un override temporal y apilable al `ThemeProvider` para superficies institucionales forzadas, y aplicarlo al frame de onboarding. No se modifica la preferencia almacenada ni el tema general de la sesión.

## Design

1. `BrandLockup` es la única composición visible del isotipo y el wordmark. El asset
   representa `O`; por eso el texto DOM es `neITB` y el nombre accesible es `OneITB`.
2. `ThemeProvider` mantiene separados `theme` (preferencia persistida) y
   `effectiveTheme` (tema efectivamente renderizado).
3. `useThemeOverride('light')` registra un override apilable durante el montaje y lo
   elimina durante el desmontaje. El cleanup restaura el override anterior o la
   preferencia persistida.
4. `AcademicOnboardingFrame` usa el override y clases exclusivamente claras. No llama a
   `setTheme`, no escribe `localStorage` y no conoce la implementación del provider.

## Risks and Mitigations

- **Parpadeo de tema**: aplicar el tema efectivo con `useLayoutEffect` antes del paint.
- **Override huérfano**: devolver cleanup idempotente desde el registro.
- **Superficies anidadas**: mantener una pila por identidad, no un booleano global.
- **Regresión accesible**: conservar `role="img"` y `aria-label="OneITB"` en el lockup.

## Validation

- Pruebas focalizadas de branding, provider, Header y onboarding.
- Suite completa Vitest y build Vite.
- Inspección manual pendiente en 320-1440 px y navegación real de entrada/salida.
