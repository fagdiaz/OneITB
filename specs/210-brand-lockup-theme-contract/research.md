# Research

## Hallazgo

El defecto combinaba dos contratos distintos. El lockup repetía la `O` porque el
isotipo ya representa esa letra, y el onboarding heredaba la preferencia oscura global
aunque su superficie de configuración debía permanecer clara.

## Decisiones

- Se conserva el asset existente sin filtros en tema claro.
- El wordmark visible pasa a `neITB`; `OneITB` permanece como etiqueta accesible.
- No se elimina el tema persistente ni se fuerza globalmente a `light`.
- El override visual se modela como estado efímero del provider y soporta anidación.
- `useLayoutEffect` aplica el tema efectivo antes de que el navegador pinte la ruta.

## Alternativas descartadas

- Sobrescribir `oneitb-theme` al entrar: destruye una preferencia explícita.
- Agregar `!important` o estilos locales contra `.dark`: deja el DOM en un estado
  semánticamente incoherente y no resuelve componentes descendientes.
- Duplicar composiciones del logo por pantalla: reintroduce divergencia de marca.
