# Brand and Theme Contract

## BrandLockup

- El símbolo visual representa la `O` de OneITB.
- El texto visible adyacente es exactamente `neITB`.
- La etiqueta accesible predeterminada es `OneITB`.
- El símbolo no recibe filtros, brillo ni recoloreado por defecto.

## ThemeProvider

- `theme` representa la preferencia persistida.
- `effectiveTheme` representa el tema aplicado al documento.
- `setTheme` y `toggleTheme` pueden persistir preferencia.
- `registerThemeOverride` y `useThemeOverride` nunca escriben `localStorage`.
- Desmontar una superficie restaura el override anterior o la preferencia del usuario.

## Academic onboarding

- `/onboarding/academic` usa tema efectivo claro.
- No permite alternar tema durante el paso obligatorio.
- Una recarga directa no cambia la preferencia que se restaurará al salir.
