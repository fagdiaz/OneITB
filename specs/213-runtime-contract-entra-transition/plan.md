# Implementation Plan: Runtime Contract and Entra Transition

## Technical Context

React/MSAL redirect + AuthContext/Apollo; HotChocolate 14; scripts PowerShell finitos.
No migración EF. Riesgo alto por identidad y frontera de sesión.

## Design

1. Crear un preflight finito que consulte el schema real y compare operaciones críticas.
2. Exponer versión/commit del backend mediante metadata operativa o log de startup, sin
   crear un endpoint REST de negocio.
3. Modelar el callback como máquina de estados explícita: handling, token exchange,
   session commit, routing y recoverable error.
4. Suspender guards y terminación automática mientras el flujo institucional es válido.
5. Probar remount, callback repetido, cancelación y backend incompatible.

## Constitution Check

- Preserva JWT propio, PKCE, validación backend y aislamiento Apollo.
- No registra tokens ni flexibiliza seguridad de terceros.
- Validación runtime finita, con PID y cleanup cuando se requiera reinicio.

## Primary Files

- `FrontEnd/OneItb-FE/src/Components/auth/MicrosoftRedirectCallback.jsx`
- `FrontEnd/OneItb-FE/src/router/Routing.jsx`
- `FrontEnd/OneItb-FE/src/context/AuthContext.jsx`
- `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
- `API Graphql/OneITB/Startup.cs`
- `specs/213-runtime-contract-entra-transition/runtime-contract.ps1`

