# Reporte de Auditoría: Módulo MOD-05 - Bolsa de Trabajo, Empleabilidad, Postulaciones y CV Builder

**Fecha y Hora:** 2026-10-29T22:55:00-03:00  
**Estado del Módulo:** AUDITED (Auditado al 100%)  
**Archivos Inspeccionados:** 13 archivos (Frontend: 7, Backend: 6)

---

## 1. Resumen Ejecutivo del Módulo

| Métrica | Cantidad |
| :--- | :---: |
| Vistas / Pantallas Analizadas | 4 |
| Botones y Acciones Interactivas | 15 |
| 🔴 Hallazgos Críticos (Bloqueantes / Rotos) | 0 |
| 🟡 Advertencias (Gaps / UX / Incompletos) | 2 |
| 🟢 Oportunidades de Reducción de Código | 2 |

---

## 2. Matriz Detallada de Componentes y Botones

### Vista: `JobBoard` (`FrontEnd/OneItb-FE/src/Components/jobs/JobBoard.jsx`)
* **Ruta de Acceso:** `/empleos`
* **Roles Autorizados:** Todos los roles autenticados

#### Botón / Acción: `Postularme a Oferta Laboral`
* **Ubicación:** Línea 388 en `JobBoard.jsx`
* **Comportamiento en UI:**
  * Visibilidad: Solo habilitado para `Estudiante` y `Egresado`. Para otros roles se muestra deshabilitado o informativo.
  * Estado de carga: Spinner "Postulando..." (`applyingOfferId === offer.id`)
  * Feedback: Transiciona de inmediato a badge verde "Postulado" (`hasApplied === true`)
* **Contrato GraphQL:**
  * Operación: `APPLY_TO_JOB` (`mutation ApplyToJob($jobOfferId: UUID!)`)
  * Hook: `useMutation(APPLY_TO_JOB)`
  * Caché de Apollo: Actualiza el nodo de la oferta agregando al postulante a la lista
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `ApplyToJob`
  * Autorización: `[Authorize(Roles = new[] { "Estudiante", "Egresado" })]`
  * Servicio: `JobService.cs` -> `ApplyToJobAsync`
  * Persistencia: Inserción en `JobApplications` vinculando `ApplicantId`, `JobOfferId` y estado inicial `APPLIED`
* **Diagnóstico y Estado:** 🟢 OK (Prevención estricta de postulaciones duplicadas).

#### Botón / Acción: `Nueva Oferta Laboral (Modal)`
* **Ubicación:** Línea 310 en `JobBoard.jsx`
* **Comportamiento en UI:**
  * Visibilidad: Exclusivo para `Administrador` y `Empleador`
  * Modal: Formulario con Título, Empresa, Descripción, Modalidad/Ubicación
* **Contrato GraphQL:**
  * Operación: `CREATE_JOB_OFFER` (`mutation CreateJobOffer(...)`)
  * Hook: `useMutation(CREATE_JOB_OFFER)`
  * Transmisión en Vivo: Dispara suscripción WebSocket `JOB_OFFER_CREATED` (`JobOfferTopics.Created`)
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `CreateJobOffer`
  * Servicio: `JobService.cs` -> `CreateJobOfferAsync`
  * Persistencia: Inserción en `JobOffers`
* **Diagnóstico y Estado:** 🟢 OK

#### Componente Reactivo: `Suscripción WebSocket de Ofertas de Trabajo`
* **Ubicación:** Línea 153 en `JobBoard.jsx`
* **Contrato:** `JOB_OFFER_CREATED` (`subscription OnJobOfferCreated`)
* **Diagnóstico:** 🟢 OK (Inserta la nueva vacante en el tope de la lista en tiempo real).

---

### Vista: `EmployerJobOffers` (`FrontEnd/OneItb-FE/src/Components/jobs/EmployerJobOffers.jsx`)
* **Ruta de Acceso:** `/empleos/mis-ofertas`
* **Roles Autorizados:** `Empleador`, `Administrador`

#### Botón / Acción: `Actualizar Estado de Postulante`
* **Ubicación:** Línea 233 en `EmployerJobOffers.jsx`
* **Comportamiento en UI:**
  * Selector desplegable: `APPLIED`, `REVIEWING`, `INTERVIEW`, `OFFERED`, `REJECTED`
  * Estado de carga: Spinner en fila (`updatingStatus`)
* **Contrato GraphQL:**
  * Operación: `UPDATE_APPLICATION_STATUS`
  * Hook: `useMutation(UPDATE_APPLICATION_STATUS)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `UpdateApplicationStatus`
  * Servicio: `JobService.cs` -> `UpdateApplicationStatusAsync`
  * Control de Acceso: Verifica que la oferta pertenezca al empleador autenticado (`actorId == offer.EmployerId || actorRole == "Administrador"`)
  * Persistencia: Modificación de `JobApplication.Status` y notificación automática al estudiante
* **Diagnóstico y Estado:** 🟢 OK

---

### Vista: `EmployerRequestForm` (`FrontEnd/OneItb-FE/src/Components/jobs/EmployerRequestForm.jsx`)
* **Ruta de Acceso:** `/empleos/solicitud`
* **Roles Autorizados:** Público (Anónimo)

#### Botón / Acción: `Enviar Solicitud de Adhesión (Submit)`
* **Ubicación:** Línea 120 en `EmployerRequestForm.jsx`
* **Comportamiento en UI:**
  * Validación local de CUIT (11 dígitos numéricos sin guiones), email corporativo y teléfono
  * Estado de carga: `disabled={loading}`, texto "Enviando solicitud..."
  * Feedback: Transición a pantalla de agradecimiento y confirmación de revisión institucional
* **Contrato GraphQL:**
  * Operación: `SUBMIT_EMPLOYER_REQUEST`
  * Hook: `useMutation(SUBMIT_EMPLOYER_REQUEST)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `SubmitEmployerRequest`
  * Servicio: `EmployerRequestService.cs` -> `SubmitRequestAsync`
  * Validación Robusta: `EmployerRequestValidation.cs` aplica algoritmo formal de checksum fiscal Módulo 11
  * Persistencia: Inserción en `EmployerRequests` con estado inicial `Pending`
* **Diagnóstico y Estado:** 🟢 OK

---

### Vista: `UserProfile` / `CvEditorProfile` (CV ATS Builder)
* **Rutas de Acceso:** `/profile`, `/profile/edit`
* **Roles Autorizados:** Todos los usuarios autenticados

#### Botón / Acción: `Exportar CV Optimizado para ATS (PDF)`
* **Ubicación:** Línea 362 en `UserProfile.tsx`
* **Comportamiento en UI:**
  * Hook `useCvAtsPrint` activa diálogo de impresión del navegador
  * Estilos `@media print` garantizan formato A4, tipografía legible por parsers ATS (Workday, Greenhouse) y omisión de elementos interactivos de UI
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Guardar Secciones del CV (Experiencia, Educación, Proyectos, Habilidades, Idiomas)`
* **Ubicación:** Línea 431 en `CvEditorProfile.tsx`
* **Contrato GraphQL:** `UPDATE_PROFILE` (`Mutation.cs` -> `UpdateProfile`)
* **Diagnóstico y Estado:** 🟢 OK

---

## 3. Oportunidades de Optimización y Reducción de Líneas

### A. Código Muerto / Huérfano
* `FrontEnd/OneItb-FE/src/Components/jobs/employerNavigation.js`: Archivo de solo 168 bytes con helpers de navegación hacia `/empleos/mis-ofertas` que solo se importan en un lugar y pueden reemplazarse por `<Link to="/empleos/mis-ofertas">` estándar.

### B. Boilerplate y Simplificación
* `FrontEnd/OneItb-FE/src/hooks/useCvAtsPrint.ts`: Inyecta dinámicamente elementos `<style>` en el `<head>` del DOM al imprimir y los remueve después. Esto puede trasladarse a reglas puras de Tailwind `@media print` en `index.css`, reduciendo ~50 líneas de manipulación imperativa del DOM.

---

## 4. Advertencias y Gaps Detectados (Sin romper Code Freeze)

1. 🟡 **Discrepancia en Rutas de Bolsa de Trabajo y CV:**  
   `audit_state.json` especificaba `/empleos/:id`, `/mis-postulaciones`, `/cv`, `/cv/editar` y `/empresa/ofertas`.
   - No existe `/empleos/:id`; el sistema utiliza scroll y resaltado mediante `/empleos?offerId=...`.
   - No existe una página dedicada `/mis-postulaciones`; las postulaciones del estudiante se distinguen con la etiqueta `Postulado` en la lista global de `/empleos`.
   - Las rutas `/cv` y `/cv/editar` no existen; el currículum se encuentra en `/profile` y `/profile/edit`.
   - La ruta para empleadores es `/empleos/mis-ofertas` (no `/empresa/ofertas`).  
   *Propuesta de Cierre:* Incorporar redirecciones en `Routing.jsx`:  
   `<Route path="cv" element={<Navigate to="/profile" replace />} />` y `<Route path="empresa/ofertas" element={<Navigate to="/empleos/mis-ofertas" replace />} />`.

2. 🟡 **Validación Asimétrica de CUIT:**  
   La UI solo valida `\d{11}` mientras que el backend ejecuta la validación matemática Módulo 11. Un CUIT ficticio de 11 números idénticos (ej. `11111111111`) es aceptado por el formulario y solo es rechazado al responder el backend. No bloquea pero es una pequeña inconsistencia de UX.

---

## 5. Conclusiones y Próximos Pasos para este Módulo
El Módulo 05 (Bolsa de Empleo y CV) cuenta con un **flujo de postulaciones y onboarding corporativo completamente operativo**: validación matemática de CUIT, notificaciones en tiempo real vía WebSockets, actualización de estado de candidatos y exportación de currículum optimizado para sistemas ATS.

Procede avanzar inmediatamente al **Módulo 06: Administración, Moderación, Reportes y Auditoría**.
