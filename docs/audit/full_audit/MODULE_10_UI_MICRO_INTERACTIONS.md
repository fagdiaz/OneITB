# Reporte de Auditoría Forense: Módulo MOD-10 - Micro-Interacciones UI (Modales, Cierres, Dropdowns y Accesibilidad)

**Fecha y Hora:** 2026-10-29T23:25:00-03:00  
**Estado del Módulo:** AUDITED (Auditado al 100%)  
**Motor de Auditoría:** `speckit-code-audit` (Modo Forense)  
**Alcance:** Inspección línea por línea de los 12 componentes de modales, diálogos emergentes, visores multimedia y menús desplegables del frontend.

---

## 1. Resumen Ejecutivo del Módulo

| Métrica Forense | Cantidad / Estado |
| :--- | :---: |
| Componentes Modales / Desplegables Auditados | 12 componentes |
| Modales con Soporte Completo (Escape + Backdrop + Focus) | 5 de 10 (50% - "Gold Standard") |
| Modales con Soporte Parcial (Solo Botón X / Cancelar) | 5 de 10 (50% - Gaps de UX) |
| Menús Desplegables con Cierre por Clic Externo (`ClickOutside`) | 2 de 2 (100% operativos) |
| 🔴 Hallazgos Críticos (Bloqueo de UI / Atrapamiento irreversible) | 0 |
| 🟡 Advertencias (Falta de Backdrop Click o Tecla Escape) | 5 |
| 🟢 Oportunidades de Estandarización a Hook Único | 1 |

---

## 2. Matriz Forense de Micro-Interacciones en Modales

| Componente | Botón "X" | Botón "Cancelar" | Cierre por Backdrop Click | Cierre por Tecla `Escape` | Bloqueo de Scroll (`body.overflow`) | Restauración de Foco | Diagnóstico de UX |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`ReactionUsersModal.jsx`** | ✅ Sí | N/A | ✅ Sí (`onMouseDown` target check) | ✅ Sí (`keydown`) | ✅ Sí (`hidden`) | ✅ Sí (`element.focus()`) | 🟢 **Excelente (Gold Standard)** |
| **`NotificationPreferencesModal.jsx`** | ✅ Sí | N/A | ✅ Sí (Con guard de mutación) | ✅ Sí (Con guard de mutación) | ✅ Sí | ✅ Sí | 🟢 **Excelente (Gold Standard)** |
| **`MediaViewerModal.jsx`** | ✅ Sí | N/A | ✅ Sí | ✅ Sí (+ Flechas de Galería) | ✅ Sí | ✅ Sí | 🟢 **Excelente (Gold Standard)** |
| **`MediaGalleryModal.jsx`** | ✅ Sí | N/A | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí | 🟢 **Excelente (Gold Standard)** |
| **`ModerationReasonModal.jsx`** | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí (`autoFocus` input) | 🟢 **Excelente (Gold Standard)** |
| **`EditUserModal.jsx`** (Admin) | ✅ Sí | ✅ Sí | ❌ No | ❌ No | ❌ No | ❌ No | 🟡 **WARNING:** Solo cierra por botones |
| **`ReportModal.jsx`** (Social) | ✅ Sí | ✅ Sí | ❌ No | ❌ No | ❌ No | ❌ No | 🟡 **WARNING:** Solo cierra por botones |
| **`JobBoard.jsx`** (Modal Oferta) | ✅ Sí | ✅ Sí | ❌ No | ❌ No | ❌ No | ❌ No | 🟡 **WARNING:** Solo cierra por botones |
| **`AcademicDashboard.jsx`** (Modal Recurso) | ✅ Sí | ✅ Sí | ❌ No | ❌ No | ❌ No | ❌ No | 🟡 **WARNING:** Solo cierra por botones |
| **`SubjectManagement.jsx`** (Admin) | ❌ No | ✅ Sí | ❌ No | ❌ No | ❌ No | ❌ No | 🟡 **WARNING:** Solo botón Cancelar |

---

## 3. Matriz Forense de Menús Desplegables (Dropdowns)

### A. Campana de Notificaciones (`NotificationBell.jsx`)
* **Ubicación:** `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`
* **Trigger:** Botón con icono de campana y badge numérico de no leídos.
* **Cierre por Clic Externo:** ✅ **Implementado** (Líneas 78-85):
  ```jsx
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  ```
* **Navegación al Clic:** Al hacer clic en una notificación, marca como leída y cierra el menú.
* **Diagnóstico:** 🟢 **OK**.

### B. Menú de Usuario / Perfil (`Nav.jsx`)
* **Ubicación:** `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
* **Trigger:** Avatar de usuario con chevron animado (`rotate-180`).
* **Cierre por Clic Externo:** ✅ **Implementado** (Líneas 149-158):
  Escucha en `mousedown` verificando `!dropdownRef.current.contains(event.target)`.
* **Accesibilidad:** Declara `aria-expanded={dropdownOpen}` y `aria-label="Menú de usuario"`.
* **Cierre en Rutas:** Al seleccionar "Mi Perfil", "Editar Perfil", selector de tema o "Salir", el menú se cierra automáticamente (`setDropdownOpen(false)`).
* **Diagnóstico:** 🟢 **OK**.

---

## 4. Análisis Detallado de Gaps en Modales Secundarios

### Hallazgo 1: Ausencia de Cierre por Clic en Backdrop en Formularios Administrativos
* **Archivos Afectados:** `EditUserModal.jsx`, `JobBoard.jsx` (modal nueva vacante), `AcademicDashboard.jsx` (modal nuevo apunte) y `SubjectManagement.jsx`.
* **Mecánica:** El contenedor de fondo oscurecido (`fixed inset-0 bg-slate-950/70`) no posee el manejador `onMouseDown` con verificación de `event.target === event.currentTarget`.
* **Impacto en el Usuario:** Si el usuario hace clic fuera de la tarjeta para descartar la ventana, no ocurre nada; se ve obligado a ubicar el cursor en el botón "X" o "Cancelar".
* **Propuesta de Cierre (Limpia & Minimalista):**
  Agregar al `div` del backdrop:
  ```jsx
  onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
  ```

### Hallazgo 2: Falta de Listener de Tecla `Escape`
* **Archivos Afectados:** `EditUserModal.jsx`, `ReportModal.jsx`, `SubjectManagement.jsx`.
* **Impacto:** Los usuarios de teclado o lectores de pantalla no pueden salir del diálogo presionando `Esc`.
* **Propuesta de Cierre:**
  Estandarizar mediante el hook reutilizable `useModalDismiss(isOpen, onClose)`.

---

## 5. Oportunidad de Reducción y Estandarización de Código

### Estandarización con Custom Hook `useModalA11y`
Actualmente, los 5 modales de clase "Gold Standard" (`ReactionUsersModal`, `MediaViewerModal`, `NotificationPreferencesModal`, etc.) repiten ~25 líneas de código idénticas:
1. `document.body.style.overflow = 'hidden'` / restauración.
2. `document.addEventListener('keydown', handleKeyDown)`.
3. Almacenamiento de `document.activeElement` y `focus()` de retorno.

* **Potencial de Reducción:**
  Extraer esta lógica a un hook `useModalA11y({ isOpen, onClose, submitting })`:
  * Reduce **~100 líneas de boilerplate duplicado**.
  * Otorga automáticamente soporte de `Escape` y scroll lock a los 5 modales que hoy carecen de él.

---

## 6. Conclusión del Módulo
No existen trampas de foco bloqueantes ni pérdidas de control de interfaz en **OneITB23**. Los componentes sociales y multimedia principales poseen una implementación de micro-interacciones de nivel profesional (accesibilidad, foco, teclado y scroll lock). Los formularios modales administrativos secundarios funcionan correctamente a través de sus botones explícitos, presentando oportunidades claras de homogeneización ergonómica post-freeze.
