# Plan: Spec 154 - UI Consistency & Theme Polish

## Context

Spec 153 introdujo tema dual, pero la auditoria manual detecto superficies con contraste incorrecto y una preferencia de producto: el Header debe conservar identidad oscura incluso en Clean Tech.

La plantilla oficial de `speckit-plan` referencia `docs/project_docs/REQUERIMIENTOS.md` y `PLAN_DE_MITIGACION_EVALUACION.md`; esos documentos no existen con esos nombres en la documentacion normalizada actual. Se usa `docs/project_docs/scope-and-requirements.md`, `docs/project_docs/architecture-and-design.md` y `docs/project_docs/ROADMAP.md` como fuentes canonicas vigentes.

## Technical Decisions

- Header: usar fondo base `bg-slate-900` y `dark:bg-slate-950`, manteniendo texto claro en ambos temas.
- Glow: reutilizar hover/focus con borde translucido, ring azul y shadow azul suave en Nav, avatar, busqueda y notificaciones.
- Widget: reducir dimensiones de ventana y paddings sin tocar estado Apollo/subscriptions.
- Tech Noir sweep: agregar `dark:` a superficies residuales, inputs, tablas y tarjetas. Mantener modo claro intacto.
- Print: limpiar `CVPrintTemplate` y preservar `print:bg-white`, `print:text-black`.

## Files

- `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
- `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`
- `FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx`
- `FrontEnd/OneItb-FE/src/Components/chat/ChatSidebar.jsx`
- `FrontEnd/OneItb-FE/src/Components/chat/ChatWindow.jsx`
- `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
- `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
- `FrontEnd/OneItb-FE/src/Components/admin/*.jsx`
- `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx`

## Validation

- `npm.cmd run build` from `FrontEnd/OneItb-FE`.
