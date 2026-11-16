# Feature Specification: ATS-Friendly CV Export

**Feature Branch**: `N/A - no Git operation requested`

**Created**: 2026-08-04

**Status**: Implemented `[I]`; native PDF acceptance blocked

**Input**: Convertir la previsualizacion e impresion del CV institucional en una salida
legible, seleccionable y extraible por sistemas de seguimiento de postulaciones, tomando
`F:/React/cv-builder` como referencia tecnica sin copiar features ajenas.

## User Scenarios & Testing

### User Story 1 - Exportar un CV de lectura lineal (Priority: P1)

Como estudiante o egresado, quiero previsualizar e imprimir un CV cuyo contenido conserve
un orden de lectura claro para personas y sistemas automatizados, de modo que mi identidad,
perfil, experiencia, educacion, proyectos, habilidades e idiomas no se pierdan ni se
reordenen al generar PDF.

**Why this priority**: El PDF es el artefacto que el usuario presenta fuera de OneITB. Una
plantilla visualmente correcta pero con texto truncado o desordenado reduce su utilidad.

**Independent Test**: Cargar un perfil completo, abrir la previsualizacion, generar un PDF
y comprobar que el texto puede seleccionarse y extraerse en el mismo orden visible.

**Acceptance Scenarios**:

1. **Given** un perfil con todas las secciones, **When** se abre la previsualizacion,
   **Then** aparece una unica secuencia vertical de encabezados y contenido, sin columnas
   que alteren el orden de lectura.
2. **Given** un CV con mas contenido que una hoja, **When** se imprime o exporta,
   **Then** el contenido continua en hojas adicionales sin truncarse por una altura fija.
3. **Given** datos con tildes, eñe y URLs, **When** se obtiene el PDF, **Then** el texto se
   conserva sin caracteres corruptos y los enlaces siguen siendo identificables.

---

### User Story 2 - Usar la misma fuente de verdad en ambas vistas (Priority: P1)

Como usuario, quiero que `/profile` y `/profile/edit` muestren la misma previsualizacion
imprimible, para no descargar documentos diferentes segun el punto de acceso.

**Why this priority**: La divergencia entre plantillas vuelve impredecible el resultado y
dificulta su validacion antes de la defensa.

**Independent Test**: Abrir el CV desde ambas rutas con el mismo perfil y comparar orden,
secciones, valores visibles y acciones de impresion.

**Acceptance Scenarios**:

1. **Given** el mismo perfil persistido, **When** se abre la previsualizacion desde ambas
   rutas, **Then** ambas superficies contienen las mismas secciones y valores.
2. **Given** una seccion vacia u oculta, **When** se previsualiza el CV, **Then** no se
   muestran encabezados vacios ni texto de ejemplo como contenido real.

---

### User Story 3 - Comprobar objetivamente el PDF (Priority: P2)

Como responsable de calidad, quiero un procedimiento repetible que compruebe extraccion,
orden, formato de pagina, fuentes y ausencia de cifrado, para no aceptar un CV solo porque
se ve bien en pantalla.

**Why this priority**: No existe una certificacion universal de compatibilidad ATS. La
calidad debe expresarse mediante propiedades medibles del artefacto generado.

**Independent Test**: Ejecutar el procedimiento sobre un PDF de fixture y obtener un
resultado explicito por cada criterio o un bloqueo que identifique la herramienta faltante.

**Acceptance Scenarios**:

1. **Given** un PDF generado con el fixture institucional, **When** se analiza,
   **Then** contiene todos los terminos requeridos en orden, pagina A4, texto Unicode
   valido, fuentes identificables y estado no cifrado.
2. **Given** que no existe una herramienta local de analisis, **When** se ejecuta el
   procedimiento, **Then** informa el prerrequisito faltante sin declarar el PDF aprobado.

## Edge Cases

- Perfil sin experiencia, proyectos, habilidades o idiomas.
- Descripciones extensas que necesitan mas de una pagina.
- URLs largas, telefono internacional y caracteres Unicode.
- Imagen de perfil ausente, corrupta o remota: el documento ATS no depende de ella.
- Encabezado al final de una pagina: debe permanecer junto al primer elemento cuando sea
  posible, sin ocultar contenido para forzar una sola hoja.
- El navegador o impresora no conserva etiquetas PDF: la extraccion y el orden siguen
  siendo criterios obligatorios y el limite debe documentarse.

## Requirements

### Functional Requirements

- **FR-001**: El CV imprimible MUST usar una secuencia semantica de una sola columna.
- **FR-002**: El CV MUST renderizar identidad, contacto, perfil profesional, experiencia,
  educacion, proyectos, habilidades e idiomas en un orden determinista.
- **FR-003**: El contenido MUST permanecer como texto real; informacion obligatoria no
  puede depender de imagenes, iconos, pseudo-elementos o canvas.
- **FR-004**: La impresion MUST permitir multiples paginas y MUST NOT truncar contenido
  mediante altura fija u `overflow` oculto.
- **FR-005**: Encabezados y entradas SHOULD evitar separaciones de pagina perjudiciales
  sin forzar la desaparicion de datos.
- **FR-006**: Email, telefono y URLs MUST conservar texto visible y destinos validos.
- **FR-007**: La previsualizacion de `/profile` y `/profile/edit` MUST reutilizar el mismo
  documento canonico y los mismos datos normalizados.
- **FR-008**: Avatar, adornos y temas MAY aparecer en pantalla, pero MUST ser prescindibles
  para comprender el PDF y no alterar el orden extraido.
- **FR-009**: El sistema MUST ofrecer una accion claramente identificada como exportacion
  o impresion compatible con lectura automatizada.
- **FR-010**: Debe existir una validacion repetible de texto extraido, Unicode, orden de
  secciones, A4, cifrado y fuentes.
- **FR-011**: La interfaz y documentacion MUST evitar prometer compatibilidad universal;
  debe utilizar la expresion verificable `PDF optimizado para ATS`.
- **FR-012**: El cambio MUST conservar persistencia, privacidad, autorizacion y contratos
  de perfil existentes.

### Key Entities

- **CV institucional**: proyeccion de los datos de perfil existentes; no crea una entidad
  persistente nueva.
- **Documento ATS**: representacion semantica y lineal del CV destinada a previsualizacion
  e impresion/exportacion.
- **Reporte de validacion ATS**: evidencia local del PDF generado; no contiene secretos ni
  se persiste en la base de datos.

## Success Criteria

- **SC-001**: El 100% de los terminos esperados declarados para cada fixture automatizada
  o PDF inspeccionado aparece en su salida de texto, sin persistir PII en el analizador.
- **SC-002**: Las secciones extraidas mantienen el orden definido en FR-002.
- **SC-003**: Un CV que excede una hoja genera paginas adicionales sin perder contenido.
- **SC-004**: El PDF usa pagina A4, no esta cifrado y no contiene caracteres de reemplazo.
- **SC-005**: Las dos rutas de perfil muestran el mismo conjunto y orden de secciones.
- **SC-006**: Las pruebas frontend y el build de produccion permanecen sin fallos.

## Assumptions

- La compatibilidad ATS se evalua mediante texto seleccionable, extraccion integra, orden
  lineal, Unicode, enlaces y metadatos basicos; ningun proveedor ATS universal es asumido.
- Se reutilizan `CVData`, la persistencia relacional y los permisos actuales.
- No se agrega una API de negocio REST ni un servicio headless de produccion en esta spec.
- Las herramientas externas de inspeccion PDF son un gate local y pueden quedar bloqueadas
  si no estan instaladas, sin convertir ese bloqueo en PASS.

## Out of Scope

- Matching automatico contra ofertas, scoring de candidatos o analitica de empleabilidad.
- Importacion desde LinkedIn, plantillas multiples, cartas de presentacion y features del
  proyecto de referencia no requeridas por OneITB.
- Certificar compatibilidad con todos los productos ATS del mercado.
- Cambios de base de datos, GraphQL, autenticacion o almacenamiento.
