# Lista de Control de Exportación y Paquete de Entrega Académica Único (OneITB23)

**Documento de Control:** Spec 227 (Resolución de Hallazgo ORG-12)  
**Fecha de Emisión:** 16 de noviembre de 2026  
**Estado de Entrega:** Release Candidate Académico — Paquete Editorial Consolidado  

---

## 1. Cadena de Procedencia Editorial y Fuente Maestra

| Componente | Archivo Canónico | Versión / Estado | Rol en la Cadena Editorial |
|---|---|:---:|---|
| **Fuente Maestra de Contenido** | `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md` | v2.3 | **Única fuente de verdad textual**. Contiene los 48 RF, 12 BR, 12 RNF, DER de 30 entidades y Manual de Usuario integrado. |
| **Plantilla Institucional** | `Prácticas Profesionalizantes III - Plantilla de documento base (1).docx` | 2026 | Plantilla oficial de estilos, márgenes, portada y encabezados del Instituto Tecnológico Beltrán. |
| **Procedimiento de Compilación** | `docs/entrega_final/GUIA_MAQUETACION_FINAL.md` | v3.3 | Guía técnica para compilación Pandoc / Word COM y renderizado de diagramas. |
| **Catálogo de Figuras** | `docs/entrega_final/diagramas_fuente/FIGURE_MANIFEST.md` | v1.0 | Inventario oficial de fuentes Mermaid (`.mmd`) para memoria y anexos técnicos. |

---

## 2. Inventario de Entregables Oficiales y Registro de Hashes

Conforme a la regla de procedencia de la Spec 227, la denominación de un archivo con los términos `FINAL` u `OFICIAL` no sustituye su verificación criptográfica ni su validación visual. Se designa formalmente el siguiente paquete entregable único:

| Entregable Oficial | Ubicación Canónica | Formato / Páginas | Hash SHA-256 de Integridad | Estado de Aceptación |
|---|---|:---:|---|:---:|
| **Memoria Técnica Editable** | `docs/entrega_final/salida/OneITB23_Memoria_Tecnica_PP3_2026_v2_OFICIAL_IMPRENTA.docx` | DOCX / 3.72 MB | `5bcf62a8cc03ee069f733c2e2dbaee328c3c5409f134747b4548ad2413a4f46e` | **Editable Oficial** |
| **Memoria Técnica Digital e Impresión** | `docs/entrega_final/salida/OneITB23_Memoria_Tecnica_PP3_2026_v2_OFICIAL_IMPRENTA.pdf` | PDF / 45 págs / 2.76 MB | `bf81883523912abeb7cf6c72bc45534fd49c4f96e028196fd83bcc9a48a03437` | **PDF Oficial Imprenta** |
| **Presentación de Diapositivas** | `docs/academic/defense/OneITB23-Diapositivas.pdf` | PDF / 14 slides | `cd42be9ccf71a7fd387dcd783e9e1f0e2bc7d353c764baadf84720fbb2eefbc6` | **Compilación Previa** *(pendiente de regeneración visual DF-07)* |
| **Presentación Editable** | `docs/academic/defense/OneITB23-Defensa.pptx` | PPTX | `70e8f5f6b4e195697e80b396ca1d29e8c6b80a0dad38c8992709775007319acf` | **Fuente PPTX Previa** *(pendiente de regeneración visual DF-07)* |
| **Paquete Maestro de Mesa** | `docs/academic/defense/OneITB23-Paquete-maestro.pdf` | PDF compilado | `c1c34069d859ee7f43f22ab149ec3b70059bb01e28d162de2cedf158d9c935be` | **Dossier de Mesa Evaluadora** |
| **Estructura de Contenido JSON** | `docs/academic/defense/defense-content.json` | JSON versionado | `fe80ab479475c4f19cbd41a570724e43f438f3b3f65c7305fabc1d992f75ae7e` | **Fuente Estructurada Tracked (Reconciliada DOC-04)** |

> **Nota de Procedencia de Diapositivas:** El archivo `defense-content.json` contiene la estructura del discurso de defensa, las láminas con 38 migraciones fuente y las 20 preguntas y respuestas técnicas reconciliadas (hash SHA-256 `fe80ab479475c4f19cbd41a570724e43f438f3b3f65c7305fabc1d992f75ae7e`). Los binarios compilados existentes (`OneITB23-Defensa.pptx` y `OneITB23-Diapositivas.pdf`) reflejan una compilación previa basada en el contenido inicial. Su regeneración editorial, ajuste de láminas y revisión visual permanecen explícitamente como una tarea pendiente dentro de la compuerta `DF-07` antes de la defensa; dichos binarios previos no deben distribuirse como sincronizados con el JSON vigente.

> **Clasificación de Antecedentes:** Versiones rotuladas como `v2.3_FINAL_IMPRENTA` o borradores intermedios quedan clasificadas formalmente como *antecedentes de trabajo*. Los archivos de bloqueo temporal de Word (`~$*.docx`) quedan estrictamente excluidos del paquete y no deben distribuirse.

---

## 3. Trazabilidad y Mapeo de Figuras (`FIGURE_MANIFEST.md`)

El paquete de entrega unifica la procedencia de dos grupos de diagramas complementarios:

1. **Grupo A — Cuerpo Principal de la Memoria (10 Figuras):**
   - Fig. 1: Infografía de interacción del alumno (`memoria/01-infografia-interaccion-alumno.mmd`)
   - Fig. 2: Casos de uso Social y Académico (`memoria/02-casos-uso-social-academico.mmd`)
   - Fig. 3: Casos de uso Bolsa de Trabajo (`memoria/03-casos-uso-bolsa-trabajo.mmd`)
   - Fig. 4: Casos de uso Administración (`memoria/04-casos-uso-administracion.mmd`)
   - Fig. 5: Secuencia de Registro (`memoria/05-secuencia-registro.mmd`)
   - Fig. 6: Secuencia de Login local y Entra (`memoria/06-secuencia-inicio-sesion.mmd`)
   - Fig. 7: Modelo de Dominio DER (`memoria/07-modelo-dominio-der.mmd`)
   - Fig. 8: Arquitectura de Componentes (`memoria/08-arquitectura-componentes.mmd`)
   - Fig. 9: Arquitectura de Despliegue Docker (`memoria/09-arquitectura-despliegue.mmd`)
   - Fig. 10: Calendarización Gantt (`memoria/10-calendarizacion-gantt.mmd`)

2. **Grupo B — Paquete Técnico Complementario (13 Vistas de Ingeniería):**
   - Mapeadas en `Tabla B` de `FIGURE_MANIFEST.md` a partir de `docs/academic/04-design-diagrams.md`. Se incorporan como anexos técnicos citados sin solaparse con las figuras generales.

---

## 4. Lista de Control de Calidad Preflight (APA 7 y A4)

Antes de remitir a imprenta o presentar ante la mesa evaluadora, verificar:

- [x] **Portada Institucional:** Datos de carrera (TSAS), materia (PP III), alumno (Francisco Díaz), mesa evaluadora y ciclo 2026.
- [x] **Consistencia de Fecha:** La defensa original del 07/08/2026 figura explícitamente como no realizada; no se inventan fechas futuras de reemplazo.
- [x] **Higiene de Secretos:** Ausencia absoluta de credenciales reales, contraseñas demo literales o URIs locales `file:///` en texto visible.
- [ ] **[PENDIENTE DF-05/DF-06] Formato de Página:** Tamaño de papel A4 estricto en todas las secciones, con márgenes de 2,54 cm (1 pulgada).
- [ ] **[PENDIENTE DF-05/DF-06] Tipografía y Párrafos:** Estilo uniforme, interlineado doble o institucional, sangría de primera línea de 1,27 cm.
- [ ] **[PENDIENTE DF-05/DF-06] Referencias Bibliográficas:** Formato APA 7 con sangría francesa de 1,27 cm y orden alfabético.
- [x] **[COMPLETADO DF-03/DF-05] Eliminación de Bloques Crudos:** Sustitución de bloques ```mermaid en copia de maquetación por las 10 figuras renderizadas en PNG (con splits 02a-e y 07a-c) y 10 mockups de UI.
- [ ] **[PENDIENTE DF-05/DF-06] Tablas:** Encabezados repetidos en páginas subsiguientes y sin cortes huérfanos.
- [ ] **[PENDIENTE LG-01] Auditoría de Muestra Impresa (Imprenta):** Revisión de dos páginas impresas (una de texto y una con DER/diagrama complejo) verificando contraste y legibilidad antes de encuadernar (`LG-01`).
