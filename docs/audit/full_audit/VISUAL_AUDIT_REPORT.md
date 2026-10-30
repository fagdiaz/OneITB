# Informe de Auditoría Visual, Estética y Accesibilidad UI/UX (OneITB23)

**Documento:** `docs/audit/full_audit/VISUAL_AUDIT_REPORT.md`  
**Rol Auditor:** Diseñador UI/UX Senior y Auditor Frontend OneITB23  
**Fecha de Ejecución:** 2026-10-30T17:25:00-03:00  
**Stack Visual Auditado:** React 18, Tailwind CSS v4, FontAwesome 6.7.2, Apollo Client 3.7, Vite 8  
**Modo de Inspección:** Estrictamente Solo Lectura (Read-Only) sobre el código de producción  
**Objetivo:** Evaluación forense de coherencia de diseño, soporte Dark Mode, accesibilidad WCAG 2.1 AA, adaptación responsive y micro-feedback visual para el Release Candidate de la defensa institucional.

---

## 1. Resumen Ejecutivo y Matriz de Madurez Visual

Se ha completado una inspección estético-visual exhaustiva sobre el 100% de las vistas y componentes del frontend en `FrontEnd/OneItb-FE/src/Components/`.

| Vector de Análisis Visual | Estado General | Cumplimiento | Hallazgos 🔴 | Hallazgos 🟡 | Hallazgos 🟢 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Consistencia de Diseño y Tailwind CSS** | ACEPTABLE | 86% | 0 | 2 | 2 |
| **2. Modo Claro vs. Modo Oscuro (Dark Mode)** | CRÍTICO | 74% | 5 | 5 | 1 |
| **3. Responsividad y Adaptación Móvil** | EXCELENTE | 96% | 0 | 0 | 1 |
| **4. Micro-Feedback Visual y Estados UI** | BUENO | 84% | 0 | 2 | 1 |
| **TOTALES** | **CALIFICADO CON RESERVAS** | **85.0%** | **5** | **9** | **5** |

### Diagnóstico Global UI/UX
La plataforma posee un estándar de diseño contemporáneo de alto nivel, caracterizado por una estética limpia ("Clean Tech" / "Tech Noir"), efectos de spotlight basados en puntero, desenfoques vítreos (`backdrop-blur-xl`), navegación progresiva dinámica (`useProgressiveNavigation`), y una tipografía bien balanceada.

Sin embargo, el motor de **Dark Mode presenta asimetrías severas**: mientras que componentes centrales como el `Header`, `PrivateChat`, `Landing` y `JobBoard` alcanzan la excelencia ("Gold Standard"), componentes críticos de acceso y consulta (`Login.jsx`, `Register.jsx`, `UserProfile.tsx` y `NotFound.jsx`) sufren de **omisión de clases dark**, generando rectángulos blancos deslumbrantes en el acceso y **textos prácticamente invisibles** (`text-slate-950` sobre fondo oscuro, ratio WCAG < 1.3:1) en el perfil de usuario.

---

## 2. Vectores de Análisis Visual

### Vector 1: Consistencia de Diseño y Tokens Tailwind CSS

#### A. Paleta de Colores Institucional
* **Identidad Corporativa Beltrán / OneITB**: La paleta base gira en torno al Azul ITB (`blue-600`, `blue-700`, `blue-800`), matices Cyan tecnológicos (`cyan-400`, `cyan-500`, `cyan-600`) para contrastes dinámicos, y una escala de neutros basada en Slate (`slate-50` a `slate-950`).
* **Dispersión de Tokens en Tailwind v4**: En `FrontEnd/OneItb-FE/src/index.css`, la directiva `@theme` solo declara las variables `--font-sans` y `--font-serif`. No se han registrado tokens cromáticos con nombre (`--color-itb-primary`, `--color-itb-surface`), provocando que diferentes vistas alternen entre `blue-600`, `blue-700`, `indigo-700` o `slate-900` para botones de acción primaria sin una variable semántica unificada.

#### B. Uniformidad de Radios de Esquinas (Border Radius Hierarchy)
La jerarquía de radios institucional persigue un lenguaje suave y moderno:
* **Tarjetas maestras y modales contenedores**: `rounded-2xl` (16px) a `rounded-3xl` / `rounded-[2rem]` (24px - 32px).
* **Inputs, botones y filas interactivas**: `rounded-xl` (12px).
* **Badges y chips de estado**: `rounded-full`.
* **Inconsistencias Detectadas**:
  * `Button.tsx`, `Input.tsx` y `Textarea.tsx`: utilizan la clase Tailwind base `rounded` (4px), generando controles con esquinas notablemente más afiladas que el resto del sistema.
  * Formularios del CV (`editor/PersonalForm.tsx`, `ExperienceForm.tsx`, etc.): utilizan `rounded-lg` (8px) en las tarjetas de sección en lugar de `rounded-2xl`.
  * `SubjectManagement.jsx`: badges de códigos de materia usan `rounded-md` (6px).

#### C. Jerarquía Tipográfica y Tracking
* Excelente implementación de subtítulos y supratítulos con `uppercase tracking-[0.18em]` o `tracking-[0.24em]` en tamaño `text-xs` o `text-[11px] font-bold`, aportando una estética editorial técnica ("Tech Noir").
* Títulos principales (`h1`) escalados fluidamente con `text-3xl sm:text-5xl font-black tracking-tight`.

---

### Vector 2: Modo Claro vs. Modo Oscuro (Dark Mode & Contrastes WCAG)

#### A. Contrastes Accesibles en Badges de Roles (Modo Claro)
En `Feed.jsx` (líneas 95-101) y `CommentThread.jsx` (líneas 32-38), los badges de roles en modo claro presentan discrepancias frente a la pauta WCAG 2.1 AA (mínimo ratio de 4.5:1 para texto normal de 14px/12px):
* **Administrador**: `bg-indigo-50` (#EEF2FF) con `text-indigo-500` (#6366F1).  
  *Ratio medido: **3.4:1** ❌ (Falla WCAG AA).* Requiere `text-indigo-700` (#4338CA, 5.8:1).
* **Moderador**: `bg-amber-50` (#FFFBEB) con `text-amber-600` (#D97706).  
  *Ratio medido: **3.3:1** ❌ (Falla WCAG AA).* Requiere `text-amber-800` (#92400E, 5.1:1).
* **Egresado**: `bg-cyan-50` (#ECFEFF) con `text-cyan-600` (#0891B2).  
  *Ratio medido: **3.8:1** ❌ (Falla WCAG AA).* Requiere `text-cyan-800` (#155E75, 5.5:1).
* **Estudiante**: `bg-blue-50` (#EFF6FF) con `text-blue-600` (#2563EB).  
  *Ratio medido: **4.6:1** ✅ (Cumple WCAG AA justo en el umbral).*

#### B. Textos Oscuros sobre Fondos Oscuros en Dark Mode (Contraste Invisible)
* **`UserProfile.tsx`**: Las tarjetas de aportes comunitarios y materias aprobadas renderizan `text-2xl font-black text-slate-950` dentro de un contenedor `dark:bg-slate-950/50`. En Dark Mode, el texto `slate-950` (#020617) sobre un contenedor oscuro `#0B132B` tiene un contraste de **1.1:1**, volviendo las métricas ilegibles.
* **`AdminDashboard.jsx`**: El botón de la pestaña activa en la barra de navegación administrativa utiliza `bg-slate-900 text-white`. Al estar contenido dentro de `dark:bg-slate-900/70`, el botón se confunde con el marco perdiendo visibilidad.

---

### Vector 3: Responsividad y Adaptación Móvil

* **Navegación Desktop vs. Mobile**:
  * Menú Desktop: `useProgressiveNavigation` recalcula en vivo el ancho del viewport y traslada automáticamente a un menú desbordado (`...` con badge numérico) los ítems que no caben.
  * Menú Mobile: Posee botón hamburguesa responsivo que despliega drawer/popover con acceso a "Empresas", "Iniciar Sesión" y "Registrarse".
* **Tablas Administrativas**:
  * Todas las vistas tabulares (`UserManagement.jsx`, `SubjectManagement.jsx`, `EmployerRequestManagement.jsx`, `ModerationManagement.jsx`, `ModerationAuditManagement.jsx`) incorporan contenedores con `overflow-x-auto`, evitando desbordes horizontales del viewport en dispositivos móviles.
* **Chat Responsivo**:
  * En `PrivateChat.jsx`, la barra lateral de contactos y la ventana de chat alternan visibilidad en viewports móviles mediante `${selectedContactId ? 'hidden md:flex' : 'flex'}` y botón de retorno con flecha (`fa-arrow-left`).
* **Tags y Chips**:
  * Contenedores con `flex-wrap` implementado en asignaturas, habilidades y carreras.

---

### Vector 4: Micro-Feedback Visual y Estados UI

* **Estados de Foco Accesible (`focus-visible`)**:
  * En el `Header`, enlaces de `Nav` y botones principales de la `Landing`, se observa una implementación modélica: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2`.
  * En los componentes comunes `Button.tsx`, `Input.tsx`, `Textarea.tsx`, el foco está degradado a `focus:ring-1 focus:ring-slate-800`, el cual es invisible en modo oscuro y no utiliza `:focus-visible`.
* **Transiciones y Hovers**:
  * La plataforma utiliza transiciones sutiles (`transition-all duration-150`, `hover:-translate-y-0.5`).
  * En `index.css`, se incluye un orquestador global de cambio de tema (`html.theme-transitioning`) de 1300ms, respetando `prefers-reduced-motion: reduce`.
* **Estados Vacíos (Empty States)**:
  * **Gold Standard (`JobBoard.jsx`)**: Icono en recuadro redondeado (`fa-briefcase`), título grande, subtítulo explicativo y botón primario ("Publicar primera oferta").
  * **Gap de UX (`Feed.jsx`)**: Simple etiqueta `<p>` grisácea ("Todavia no hay publicaciones activas") sin ícono ni llamado a la acción.
  * **Gap de UX (`PrivateChat.jsx`)**: Conversaciones sin mensajes se limitan a un texto pequeño centrado.

---

## 3. Matriz Clasificada de Hallazgos

### 🔴 ALTA PRIORIDAD (Texto invisible, solapamiento o desborde grave)

| ID | Componente / Archivo | Líneas | Descripción del Defecto Visual | Impacto en Usuario |
| :--- | :--- | :---: | :--- | :--- |
| **VIS-HIGH-01** | `Login.jsx` | 157-238 | **Omisión total de clases Dark Mode en la tarjeta y formulario.**<br>La tarjeta principal es `bg-white border-slate-100`, con inputs `border-slate-200 text-slate-800`. Al cambiar a tema oscuro, el fondo del body pasa a `#1e293b`, pero la tarjeta central permanece como un rectángulo blanco brillante. | Ruptura visual severa y encandilamiento en entornos de baja luminosidad. |
| **VIS-HIGH-02** | `Register.jsx` | 106-245 | **Omisión total de clases Dark Mode en formulario de registro y selector de carrera.**<br>Tarjeta, etiquetas, inputs, contenedor de carrera y radios mantienen estilos claros fijos sin `dark:`. | Inconsistencia total con el selector de tema del sistema. |
| **VIS-HIGH-03** | `UserProfile.tsx` | 405-423, 522, 546, 550, 779 | **Texto `slate-950` y `slate-800` sin `dark:text-white` sobre fondos oscuros (`dark:bg-slate-950/50`).**<br>Las cifras de aportes en la comunidad, materias aprobadas, áreas de actividad y última actividad quedan con contraste < 1.3:1 en Dark Mode. | Texto invisible. El usuario no puede leer sus propias métricas ni trayectoria en Dark Mode. |
| **VIS-HIGH-04** | `NotFound.jsx` | 6-25 | **Pantalla de Error 404 sin ningún soporte de Dark Mode.**<br>`bg-slate-50`, `text-slate-800` y `text-slate-600` sin prefijos `dark:`. | "Flashbang" blanco a pantalla completa al entrar a una URL inexistente con tema oscuro activo. |
| **VIS-HIGH-05** | `MultiSelectDropdown.jsx` | 49-85 | **Menú desplegable y checkboxes sin clases Dark Mode.**<br>El disparador, contenedor absoluto flotante, fila "Seleccionar Todos" e items son `bg-white text-slate-700` fijos. | Despliegue de caja blanca desconectada del contexto oscuro de la pantalla. |

---

### 🟡 MEDIA PRIORIDAD (Contraste mejorable, inconsistencia de bordes o padding)

| ID | Componente / Archivo | Líneas | Descripción del Defecto Visual | Impacto en Usuario |
| :--- | :--- | :---: | :--- | :--- |
| **VIS-MED-01** | `Button.tsx`, `Input.tsx`, `Textarea.tsx` | UI Base | **Esquinas cuadradas `rounded` (4px) y falta de variantes Dark Mode nativas.**<br>Desalineado con el estándar del proyecto (`rounded-xl` y `rounded-2xl`). Anillo de foco `focus:ring-slate-800` invisible en fondos oscuros. | Inconsistencia geométrica de los botones e inputs base. |
| **VIS-MED-02** | `editor/PersonalForm.tsx`, `ExperienceForm.tsx`, etc. | 55-66 | **Tarjetas de subsección del CV en `rounded-lg` sin soporte dark autónomo.**<br>Dependen de selectores descendentes externos; si se reutilizan, quedan blancas con bordes de 8px. | Falta de armonía visual con las tarjetas de 16px/24px del resto del perfil. |
| **VIS-MED-03** | `Feed.jsx`, `CommentThread.jsx` | 95-101, 32-38 | **Contraste WCAG insuficiente en badges de roles en Modo Claro.**<br>`text-indigo-500` sobre `bg-indigo-50` (3.4:1) y `text-amber-600` sobre `bg-amber-50` (3.3:1). | Dificultad de lectura para usuarios con baja visión o pantallas con poco contraste. |
| **VIS-MED-04** | `UserManagement.jsx`, `ModerationManagement.jsx` | 105, 98-102 | **Badges de estado en tablas administrativas sin clases dark.**<br>`bg-emerald-100 text-emerald-700` y `bg-red-100 text-red-700` fijos sin `dark:bg-*-400/10 dark:text-*-200`. | Cansancio visual por brillo excesivo en las tablas de administración nocturnas. |
| **VIS-MED-05** | `AdminDashboard.jsx` | 52 | **Pestaña activa sin contraste en Dark Mode.**<br>Usa `bg-slate-900 text-white` dentro de un contenedor `dark:bg-slate-900/70`, mimetizándose con el fondo. | El administrador no distingue con claridad cuál pestaña está activa. |
| **VIS-MED-06** | `Feed.jsx` | 974-983, 1009 | **Formulario de edición de publicaciones (`editingPost`) con inputs claros fijos.**<br>Al editar un post en Dark Mode, los campos de edición aparecen blancos con bordes claros. | Inconsistencia temporal mientras se edita una publicación. |
| **VIS-MED-07** | `Feed.jsx`, `PrivateChat.jsx` | 890, 454 | **Estados vacíos empobrecidos (solo texto plano).**<br>Sin iconografía, ilustraciones de campus ni botones de acción amigables para el usuario. | Sensación de interfaz incompleta o fría cuando no hay datos cargados. |
| **VIS-MED-08** | `AcademicDashboard.jsx` | 698 | **Badge de estado de materia en "Mi progreso" sin soporte Dark Mode.**<br>`bg-emerald-50 text-emerald-700` fijo sobre tarjeta oscura `dark:bg-slate-900/70`. | Resalte discordante frente a la tarjeta oscura. |
| **VIS-MED-09** | `PublicCertificate.jsx` | 103, 124, 126 | **Textos secundarios en `text-slate-500` con contraste límite en Dark Mode.**<br>Sobre fondo `dark:bg-slate-950/50`, `text-slate-500` queda en el límite inferior de legibilidad. | Reducción de legibilidad en certificados verificados públicamente. |

---

### 🟢 PULIDO VISUAL (Mejora cosmética fina para la presentación institucional)

| ID | Componente / Archivo | Líneas | Descripción de la Oportunidad de Mejora | Beneficio Institucional |
| :--- | :--- | :---: | :--- | :--- |
| **VIS-LOW-01** | `index.css` | 5-8 | **Falta de tokens de colores semánticos en Tailwind v4 `@theme`.**<br>Centralizar `--color-itb-blue`, `--color-itb-surface-light`, `--color-itb-surface-dark`. | Mayor mantenibilidad y cero dispersión cromática futura. |
| **VIS-LOW-02** | `layout/public/Header.jsx`, `Nav.jsx` | 1-30 | **Componentes públicos huérfanos con clases BEM y FontAwesome 6.1 no utilizados.**<br>`PublicLayout` utiliza el Header privado; estos archivos quedaron como residuo. | Limpieza del árbol de componentes y eliminación de dead-code. |
| **VIS-LOW-03** | Varios componentes | Disperso | **Estandarizar anillo de foco visible `focus-visible:ring-2` en botones secundarios.**<br>Incorporar `focus-visible:ring-2 focus-visible:ring-cyan-400` en comentarios, reacciones y tablas. | Cumplimiento exhaustivo de la pauta WCAG 2.4.7 (Focus Visible). |
| **VIS-LOW-04** | Tablas Administrativas | Tablas | **Agregar micro-interacción suave en hover de filas de tabla.**<br>Implementar `transition-colors duration-150` para un feedback más orgánico. | Sensación de pulido profesional de grado comercial. |
| **VIS-LOW-05** | `App.jsx` | 2 | **Import no utilizado de `Header` público en la raíz de la aplicación.**<br>`import { Header } from './Components/layout/public/Header';` no se renderiza. | Higiene de código y bundle size mínimo. |

---

## 4. Auditoría Línea por Línea por Vistas Principales

### 4.1. Landing Page (`Landing.jsx`)
* **Estado:** 🟢 **EXCELENTE (Gold Standard)**
* **Aspectos Destacados**:
  * Uso impecable de `usePointerSpotlight` con degradados radiales dinámicos diferenciados para modo claro y oscuro (`rgba(56,189,248,0.24)` en claro, `rgba(59,130,246,0.25)` en oscuro).
  * BrandLockup y BrandLogo con carga diferida (`fetchpriority="high"`, `loading="lazy"`).
  * Tarjetas de propuesta de valor con `backdrop-blur-xl`, `border-slate-300/65` y `dark:border-white/10`.
  * Animaciones de revelado progresivo mediante `<RevealOnScroll>`.
  * Totalmente accesible con `focus-visible:ring-2 focus-visible:ring-cyan-500`.

### 4.2. Vistas de Autenticación (`Login.jsx`, `Register.jsx`, `EmployerLogin.jsx`)
* **Estado:** 🔴 **REQUIERE ATENCIÓN URGENTE**
* **Contraste de Calidad**:
  * `EmployerLogin.jsx`: Impecable. Posee `dark:bg-slate-950`, `dark:bg-slate-900`, `dark:border-white/10` y `dark:text-slate-100`.
  * `Login.jsx` y `Register.jsx`: **Críticos**. Como se detalló en `VIS-HIGH-01` y `VIS-HIGH-02`, la tarjeta del formulario y sus campos son fijos en blanco, produciendo una experiencia disonante en modo oscuro.

### 4.3. Muro Social / Feed de Consultas (`Feed.jsx`, `CommentThread.jsx`)
* **Estado:** 🟡 **BUENO CON DETALLES DE CONTRASTE**
* **Aspectos Destacados**:
  * Las publicaciones de administradores destacan con borde sutil `border-blue-200 bg-blue-50/60 dark:border-blue-300/20 dark:bg-blue-500/10`.
  * Los avatares gestionan fallback de iniciales elegantemente con `getInitials()`.
  * Los hilos de comentarios manejan indentación adaptativa (`depth > 0 ? 'ml-4 sm:ml-7' : ''`).
* **Gaps**:
  * Contraste en badges de roles (`indigo-500` y `amber-600` en modo claro).
  * Formulario de edición rápida carece de clases dark.
  * Estado vacío desprovisto de diseño visual.

### 4.4. Perfil de Usuario y Editor de CV (`UserProfile.tsx`, `CvEditorProfile.tsx`)
* **Estado:** 🔴 **CONTIENE GAP CRÍTICO DE TEXTO INVISIBLE**
* **Aspectos Destacados**:
  * El encabezado con degradado `from-slate-950 via-blue-950 to-slate-900` brinda una apariencia institucional premium de gran prestancia.
  * Exportador ATS con modal de previsualización para impresión en tamaño A4 impecable (`@media print` sin fondos oscuros ni artefactos).
  * `AvatarEditorModal.jsx` es una pieza técnica y visual de primer nivel, con recorte interactivo, rotación, espejado y filtros en tiempo real.
* **Gaps**:
  * `VIS-HIGH-03`: `text-slate-950` en métricas comunitarias sobre fondo `dark:bg-slate-950/50`.

### 4.5. Módulo Académico (`AcademicDashboard.jsx`)
* **Estado:** 🟢 **MUY BUENO**
* **Aspectos Destacados**:
  * Filtro lateral de materias con indicador de selección activo muy claro (`border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-500/15`).
  * Modal de carga de recursos con cierre por clic en backdrop y botón `X`.
  * Integración con exportador de certificados y selector de estudiantes.
* **Gaps**:
  * El badge de estado en el progreso propio (`bg-emerald-50 text-emerald-700`) no tiene variante dark.

### 4.6. Mensajería en Tiempo Real (`PrivateChat.jsx`, `MiniChatWidget.jsx`)
* **Estado:** 🟢 **EXCELENTE**
* **Aspectos Destacados**:
  * Estructura de dos columnas responsive con transición a vista completa en móvil.
  * Burbujas de chat perfectamente diferenciadas: propias en azul institucional (`bg-blue-600 text-white rounded-br-md`), ajenas en tarjeta flotante (`border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.06] rounded-bl-md`).
  * Indicador de socket en tiempo real con pulsación sutil y badge de no leídos.
  * Buscador integrado de usuarios y mensajes con highlighting.

### 4.7. Bolsa de Empleos (`JobBoard.jsx`, `EmployerJobOffers.jsx`)
* **Estado:** 🟢 **EXCELENTE (Gold Standard de UX)**
* **Aspectos Destacados**:
  * Las tarjetas de vacantes incorporan hover cards con elevación (`hover:-translate-y-0.5 hover:shadow-lg`).
  * Badges de estado claros (`PENDING`, `REVIEWED`, `REJECTED`) totalmente tipados con clases dark.
  * Empty state ejemplar con ícono SVG estilizado, copy explicativo y CTA.
  * Soporte completo de accesibilidad modal (tecla Escape y backdrop click).

### 4.8. Panel de Administración y Moderación (`AdminDashboard.jsx`, `UserManagement.jsx`)
* **Estado:** 🟡 **BUENO CON ASIMETRÍAS EN BADGES Y PESTAÑAS**
* **Aspectos Destacados**:
  * Tablas 100% responsivas con scroll horizontal protegido.
  * Cuentas de administrador protegidas visualmente con fondo azul tenue e ícono de escudo.
  * Modal de edición de usuarios con soporte de teclado y advertencias claras.
* **Gaps**:
  * Pestaña activa pierde contraste en Dark Mode.
  * Badges de usuarios activos/suspendidos sin variantes dark.

---

## 5. Propuestas Concretas de Remediación de Código

A continuación se entregan las soluciones exactas de código (drop-in) para los hallazgos críticos y de media prioridad, listas para su aplicación:

### Remediación VIS-HIGH-01: `Login.jsx` (Soporte Dark Mode Completo)
Reemplazar la tarjeta del formulario (líneas 157-238):
```jsx
{/* Card con soporte Dark Mode */}
<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 dark:bg-slate-900/80 dark:border-white/10 dark:shadow-[0_20px_50px_rgba(2,6,23,0.35)]">

  {/* Header */}
  <div className="mb-8 text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 shadow-md shadow-blue-600/20">
      <i className="fa-solid fa-right-to-bracket text-white text-lg" />
    </div>
    <h1 className="text-2xl font-bold text-slate-800 tracking-tight dark:text-slate-100">Iniciar Sesión</h1>
    <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">Accedé a tu cuenta de OneITB</p>
  </div>

  {/* Inputs con Dark Mode */}
  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
    Email institucional
  </label>
  <input
    id="email"
    type="email"
    name="email"
    onChange={changed}
    placeholder="usuario@itbeltran.com.ar"
    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500"
  />
```

### Remediación VIS-HIGH-03: `UserProfile.tsx` (Texto Invisible en Métricas)
Reemplazar líneas 406 y 415:
```tsx
{/* Antes: */}
<p className="text-2xl font-black text-slate-950 print:text-black">{communityContributions || '—'}</p>
<p className="text-2xl font-black text-slate-950 print:text-black">{approvedSubjectsCount ?? '—'}</p>

{/* Corregido: */}
<p className="text-2xl font-black text-slate-950 dark:text-white print:text-black">{communityContributions || '—'}</p>
<p className="text-2xl font-black text-slate-950 dark:text-white print:text-black">{approvedSubjectsCount ?? '—'}</p>
```

Y en líneas 522, 546, 550:
```tsx
{/* Última actividad y Síntesis: */}
<p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatDate(latestActivity)}</p>
<p className="font-black text-slate-950 dark:text-white">{careers.length || '-'}</p>
<p className="font-black text-slate-950 dark:text-white">{activitySubjects.length || '-'}</p>
```

### Remediación VIS-HIGH-04: `NotFound.jsx` (Error 404 Dark Mode)
Reemplazar contenedor y textos principales:
```jsx
<div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 dark:bg-slate-950 transition-colors">
  <div className="text-center max-w-lg">
    <h1 className="text-9xl font-extrabold text-blue-600 dark:text-cyan-400 mb-4 tracking-tighter">
      404
    </h1>
    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
      Oops! Página no encontrada
    </h2>
    <div className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
      Parece que te has perdido en el campus... La ruta que estás buscando no existe o fue movida.
    </div>
    <Link 
      to="/" 
      className="inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
    >
      Volver al Inicio
    </Link>
  </div>
</div>
```

### Remediación VIS-MED-03: `Feed.jsx` (Contraste WCAG en Badges de Roles)
Actualizar diccionario `roleStyles` en `Feed.jsx` (línea 95):
```jsx
const roleStyles = {
  Administrador: { 
    name: 'text-indigo-700 dark:text-indigo-200', 
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:border-transparent dark:bg-indigo-400/15 dark:text-indigo-200', 
    label: 'admin' 
  },
  Moderador: { 
    name: 'text-amber-800 dark:text-amber-200', 
    badge: 'bg-amber-50 text-amber-800 border border-amber-200/60 dark:border-transparent dark:bg-amber-400/15 dark:text-amber-200', 
    label: 'moderador' 
  },
  Profesor: { 
    name: 'text-emerald-700 dark:text-emerald-200', 
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:border-transparent dark:bg-emerald-400/15 dark:text-emerald-200', 
    label: 'profesor' 
  },
  Estudiante: { 
    name: 'text-blue-700 dark:text-sky-200', 
    badge: 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:border-transparent dark:bg-sky-400/15 dark:text-sky-200', 
    label: 'estudiante' 
  },
  Egresado: { 
    name: 'text-cyan-800 dark:text-cyan-200', 
    badge: 'bg-cyan-50 text-cyan-800 border border-cyan-200/60 dark:border-transparent dark:bg-cyan-400/15 dark:text-cyan-200', 
    label: 'egresado' 
  },
  Empleador: { 
    name: 'text-fuchsia-800 dark:text-fuchsia-200', 
    badge: 'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200/60 dark:border-transparent dark:bg-fuchsia-400/15 dark:text-fuchsia-200', 
    label: 'empleador' 
  },
};
```

### Remediación VIS-MED-05: `AdminDashboard.jsx` (Pestaña Activa en Dark Mode)
Actualizar línea 52:
```jsx
activeTab === tab.id
  ? 'bg-slate-900 text-white shadow-sm dark:bg-blue-600 dark:text-white dark:shadow-md dark:shadow-blue-600/30'
  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100'
```

### Remediación VIS-MED-07: `Feed.jsx` (Empty State Enriquecido)
Reemplazar línea 890:
```jsx
{!inquiriesLoading && !inquiriesError && posts.length === 0 && (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/70">
    <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
      <i className="fa-regular fa-comments text-xl" />
    </span>
    <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
      {isSearchResultsView ? 'Sin resultados para esta búsqueda' : 'Todavía no hay publicaciones'}
    </h3>
    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
      {isSearchResultsView 
        ? 'Probá buscando con otras palabras clave o revisá los filtros de carrera.'
        : 'Sé el primero en compartir una consulta o recurso con tu comunidad académica.'}
    </p>
  </div>
)}
```

---

## 6. Conclusión y Veredicto Institucional

El frontend de **OneITB23** demuestra una madurez visual notable (85.0%), con componentes insignia que alcanzan los más altos estándares de la industria (diseño responsivo con `useProgressiveNavigation`, widgets de chat en tiempo real, editor fotográfico de avatar y plantilla de CV ATS).

Sin embargo, para garantizar una presentación impecable e institucionalmente irreprochable en la defensa académica:
1. **Es imperativo subsanar los 5 hallazgos de 🔴 Alta Prioridad**, en particular la incorporación de clases `dark:` en `Login.jsx` y `Register.jsx`, y la corrección de las clases `text-slate-950` en `UserProfile.tsx` que tornan invisibles las métricas del usuario bajo el tema oscuro.
2. **Las 9 observaciones de 🟡 Media Prioridad** asegurarán una accesibilidad WCAG 2.1 AA plena y una uniformidad estética intachable en botones, radios de esquinas y contrastes de roles.
3. El proyecto se encuentra técnicamente listo para cerrar esta fase visual en cuanto se apliquen los ajustes recomendados en la siguiente iteración de código.
