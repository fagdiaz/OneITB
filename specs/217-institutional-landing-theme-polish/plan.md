# Implementation Plan: Institutional Landing and Theme Polish

## Technical Context

Cambio frontend/documental sin backend ni EF. Fuente primaria auditada:
`https://www.ibeltran.com.ar/`, que publica ISFT 197, carreras, SIU, Office 365,
formación tecnológica, empleo, sedes y contacto institucional.

## Design

1. Cambiar solo la variable/regla global de transición a 1300 ms.
2. Mantener excepciones print/reduced-motion en 0 ms.
3. Reescribir bloques del Home con jerarquía: plataforma OneITB, institución, servicios
   conectados y comunidad; preservar CTA existentes.
4. Usar enlaces oficiales y microcopy de salida; no importar assets externos.
5. Auditar 320/768/1440, light/dark, teclado y Lighthouse básico.

## Constitution Check

No agrega alcance funcional; términos institucionales verificables; accesibilidad y
rendimiento son gates; no se atribuye integración SIU que no existe.

