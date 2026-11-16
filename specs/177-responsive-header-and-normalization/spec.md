# Feature Specification: Responsive Header and Registration Normalization

**Feature Branch**: `177-responsive-header-and-normalization`
**Created**: 2026-07-10
**Status**: Draft
**Input**: Auditoria manual: bugs visuales en cabecera, warnings de React Router, normalizacion de identidad en registro y bloqueo `OpaqueResponseBlocking` para avatares servidos desde `/uploads/`.

## User Scenarios & Testing

### User Story 1 - Header usable en pantallas chicas (Priority: P1)

Como usuario autenticado o anonimo, quiero que la cabecera no se superponga ni genere scroll horizontal en pantallas pequenas, para poder navegar sin que notificaciones, admin o perfil invadan otros controles.

**Independent Test**: Reducir el ancho del navegador a rango mobile/tablet y verificar que la navegacion principal queda accesible mediante iconos o menu hamburguesa, sin overflow horizontal.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado con rol Administrador, **When** el viewport es pequeno, **Then** las opciones principales se agrupan o se muestran como iconos sin superponerse con notificaciones o perfil.
2. **Given** un usuario anonimo, **When** el viewport es pequeno, **Then** login/registro siguen accesibles sin romper la cabecera.

---

### User Story 2 - Consola limpia por warnings conocidos (Priority: P2)

Como evaluador tecnico, quiero que el router no emita warnings de migracion conocidos, para mantener una consola util durante la defensa y auditoria.

**Independent Test**: Cargar la SPA en desarrollo y verificar que no aparecen warnings de `v7_startTransition` ni `v7_relativeSplatPath`.

---

### User Story 3 - Registro con identidad normalizada (Priority: P1)

Como administrador o usuario final, quiero que los nombres y correos registrados se almacenen con formato institucional consistente, para evitar perfiles con minusculas/mayusculas arbitrarias.

**Independent Test**: Registrar un usuario con email mixto y nombre/apellido en minuscula; verificar que el backend persiste email en minuscula y nombres en Title Case.

---

### User Story 4 - Avatares locales consumibles desde frontend (Priority: P1)

Como usuario, quiero que mi avatar local se muestre sin bloqueos de respuesta opaca, para que la experiencia de perfil y cabecera sea estable.

**Independent Test**: Cargar una URL `/uploads/*.jpg` desde el frontend y verificar que la respuesta incluye cabeceras cross-origin apropiadas.

## Requirements

### Functional Requirements

- **FR-001**: La cabecera debe evitar superposicion entre navegacion, notificaciones, menu de usuario y admin en anchos pequenos.
- **FR-002**: La navegacion principal debe estar disponible en mobile mediante menu hamburguesa o iconos compactos.
- **FR-003**: El router debe habilitar los future flags necesarios para eliminar warnings conocidos de React Router v6 hacia v7.
- **FR-004**: El formulario de registro debe enviar el email en minuscula.
- **FR-005**: El backend debe aplicar `Trim` y `ToLowerInvariant` al email de registro antes de persistir.
- **FR-006**: El backend debe mantener nombres y apellidos en Title Case con cultura espanola/argentina.
- **FR-007**: La entrega de archivos estaticos locales debe agregar cabeceras que permitan consumo cross-origin seguro por el frontend.
- **FR-008**: Los cambios no deben modificar reglas profundas de negocio ni abrir nuevas rutas REST de negocio.

## Key Entities

- **User**: identidad social/académica persistida con nombre y apellido normalizados.
- **Account**: credencial asociada al usuario, con email normalizado.
- **Static Upload File**: archivo servido desde `/uploads/{file}`.

## Assumptions

- La navegacion desktop vigente debe conservar estética Clean Tech / Tech Noir.
- `/uploads` puede emitir `Cross-Origin-Resource-Policy: cross-origin` porque no contiene secretos; los permisos reales se aplican al upload, no a la lectura.
- No hay cambio de modelo EF ni migracion.

## Success Criteria

- **SC-001**: En viewport mobile/tablet no aparece scroll horizontal generado por la cabecera.
- **SC-002**: La consola ya no muestra warnings de future flags de React Router.
- **SC-003**: Un registro con `MAIL@ITBELTRAN.COM.AR`, `juan`, `perez` se persiste como `mail@itbeltran.com.ar`, `Juan`, `Perez`.
- **SC-004**: Las respuestas de `/uploads/*` incluyen cabeceras cross-origin para imagenes locales.
