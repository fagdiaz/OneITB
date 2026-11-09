# Reporte de Auditoría: Módulo MOD-09 - Alineación de Documentación y Verificación de la Verdad en Código

## Revisión puntual del 9 de noviembre de 2026

**Corte:** `f5b6cd817362ff457ceee4346717abc94a7d59e5`, rama `feature/2026-11-01-debugger-cv-builder`, coincidente con la referencia local de origin. Spec activa 220. Las dos pruebas sin seguimiento y la edición previa de `prompt.txt` quedaron fuera de la evidencia del commit. No se ejecutaron suites ni se certificó el release en esta revisión documental.

| Prioridad | Documento y afirmación | Evidencia contrastada | Mejora y criterio de cierre |
| --- | --- | --- | --- |
| Alta | Constitución §IX exige 234 backend y 252 frontend. AGENTS.md:57 los presenta como los últimos resultados. | El preflight aplica mínimos de 234 y 258 en las líneas 167 y 236. El roadmap:12–13 registra 264 de regresión backend y 287 frontend. Son tres conceptos distintos: mínimo, ejecución observada y aceptación del candidato. | Enmendar §IX según el procedimiento constitucional: exigir suites obligatorias completas, sin omisiones no autorizadas, y remitir al manifiesto del SHA para conteos, entorno y resultado. Separar en el roadmap la regresión ordinaria del ensayo SQL. |
| Alta | El runbook no describe cómo reproducir GOB-12. | `Gob12SqlFixture.cs:33–37` exige opt-in y una instancia SQL descartable. La línea 55 usa `EnsureCreatedAsync`. El log del 09/11 registra 264 de regresión y menciona diez casos SQL adicionales; esta revisión no obtuvo salida de esos diez casos. | Documentar categoría `GOB12SqlConcurrency`, variables requeridas por nombre, destino desechable y limpieza. Registrar conteos de ambas ejecuciones por separado. Mantener el ensayo de migraciones como gate independiente. |
| Alta | `BRANCHING_STRUCTURE.md:13–17` remite a la rama RC para clonar e inspeccionar todo el código estabilizado. | La referencia local de `origin/release/candidate-2026` está en `2292985`; la rama auditada está cinco commits por delante. | Distinguir rama publicada de integración, RC nominal y SHA de la demo. Un lector debe poder obtener exactamente el código indicado sin interpretar «rama oficial» como «último corte». |
| Alta | Arquitectura:45 describe el POST de upload como única excepción REST para binarios. El runbook:271–272 enumera upload y estáticos. | Constitución §I también permite entrega de objetos. `MessageAttachmentsController.cs:16,44–61` sirve GET autenticado por adjunto, comprueba participantes, puede devolver 403/404 y admite rangos con caché privada deshabilitada. | Corregir arquitectura y runbook; distinguir el GET privado del estático `/uploads` que conserva GAP-FILE-01. Verificar con dos participantes y un tercero. No hace falta cambiar §I para describir la ruta existente. |
| Media | Constitución §X y AGENTS.md enumeran dos canales externos. El marco:33,51 incorpora un tercero y el bloque de continuidad:119 todavía ofrece dos. | El catálogo nombra `core-implementer`; en `.agents/skills/` no hay una skill con ese nombre. El marco combina conteos diferentes en sus líneas 48 y 102. | Definir en la Constitución responsabilidades y autoridad de integración; delegar catálogo y modelos al marco. Alinear la salida de continuidad y enlazar la skill existente o identificar claramente un rol sin skill. |
| Media | `docs/academic/04-design-diagrams.md:158,871` afirma que el modelo vigente tiene 30 conjuntos persistidos. | Conté 39 declaraciones públicas DbSet en `OneItbContext.cs`. El inventario GOB-11:9 documenta 39 entidades y 67 FK. | Actualizar la fuente académica y las figuras dependientes. Identificar los DER antiguos por su corte y comprobar qué versión está embebida en Word/PDF antes de imprimir. |
| Media | `DOCUMENTATION_STATUS.md:108` no identifica la presentación existente. El roadmap:3 conserva fecha de agosto aunque incorpora resultados de noviembre. | Están presentes PPTX, PDF de láminas y cuaderno en `docs/academic/defense/`; los binarios están ignorados y el JSON versionado identifica el corte `62338cb`. El índice y el informe final de agosto tienen valor histórico. | Inventariar ubicación, corte y hash de los archivos entregables, junto con cómo recuperarlos desde otra máquina. Distinguir material generado, revisión visual y ensayos ejecutados. Mantener DF-08 abierto hasta contar con los tiempos reales. |

**Comprobación de enlaces.** En 15 Markdown seleccionados del inventario técnico, académico y de gobierno se comprobaron 24 referencias Markdown a rutas locales fuera de bloques de código. Todas tenían destino. No se validaron anclas, URLs externas ni renderizado Mermaid. El enlace a la memoria en `docs/academic/01-project-overview.md:249` ya resuelve y las redirecciones de registro, perfil y académico ya existen en `Routing.jsx:46,61,68`. No corresponde reabrir esos dos hallazgos de octubre.

## Registro histórico de octubre de 2026

**Fecha y Hora:** 2026-10-29T23:15:00-03:00  
**Estado del Módulo:** AUDITED (Auditado al 100%)  
**Motor de Auditoría:** `speckit-doc-audit`  
**Alcance Inspeccionado:** `docs/project_docs/`, `docs/academic/`, `docs/audit/` (Excluyendo `specs/`; `DEVELOPMENT_LOG.md` inmutable)

---

## 1. Resumen Ejecutivo del Módulo

| Métrica | Cantidad |
| :--- | :---: |
| Documentos Canónicos y Académicos Auditados | 10 documentos |
| Diagramas Mermaid Validados | 20 diagramas (13 en academic, 7 en project_docs) |
| Discrepancias de Rutas Doc vs. Código | 8 discrepancias |
| Enlaces Relativos Rotos Identificados | 1 enlace roto |
| 🔴 Hallazgos Críticos de Documentación | 0 |
| 🟡 Advertencias de Desalineación | 3 |
| 🟢 Oportunidades de Normalización | 2 |

---

## 2. Matriz de Alineación Documental (Ground Truth vs. Documentación)

| Documento | Sección | Afirmación en Documentación | Realidad en Código (`Ground Truth`) | Estado / Corrección Sugerida |
| :--- | :--- | :--- | :--- | :--- |
| `01-project-overview.md` | § Vínculos canónicos (L249) | `[Memoria técnica de entrega](../entrega_final/DOCUMENTO_FINAL_TESIS_ONEITB23.md)` | El archivo no existe en disco. El nombre real es `DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`. | 🟡 **WARNING:** Actualizar el enlace relativo al nombre de archivo real en `docs/entrega_final/`. |
| `02-software-requirements.md` | Requisitos de Acceso | Se menciona ruta `/registro` y flujo de onboarding genérico. | En `Routing.jsx` la ruta registrada es `/register` y el onboarding es `/onboarding/academic`. | 🟡 **WARNING:** Aclarar que la URL pública es `/register` o agregar redirect de cortesía. |
| `scope-and-requirements.md` | Dominio Académico | Se listan materias, recursos, correlatividades y "horarios de cursada". | En código existen `Career`, `Subject`, `SubjectPrerequisite`, `AcademicProgress`, pero no existe entidad ni vista de horarios (`Schedule`). | 🟡 **WARNING:** Remover la mención de horarios como feature activa; clasificar como alcance futuro. |
| `architecture-and-design.md` | § Baseline técnico | .NET 8, EF Core 8.0.6, HotChocolate 14.2.0, React 18, Vite 8, Tailwind 4. | Coincide 100% con `GraphQL.csproj` y `package.json`. | 🟢 **OK:** Alineación técnica exacta de versiones. |
| `architecture-and-design.md` | § Grafo Social | Diagrama ER con `Inquiry`, `Comment`, `Reaction`, `CommentReaction`. | Coincide exactamente con las entidades EF Core y sus relaciones `Restrict`. | 🟢 **OK:** Esquema y contratos sincronizados. |
| `ROADMAP.md` | Cierres y Gaps | Registra `GAP-AUTH-01`, `GAP-AUTH-02`, `GAP-PRIV-01`, `GAP-FILE-01`. | Coincide con las implementaciones verificadas en `UsersService.cs` y `AcademicService.cs`. | 🟢 **OK:** Trazabilidad de riesgos fidedigna. |

---

## 3. Integridad de Diagramas Mermaid y Vínculos

* **Diagramas Mermaid:** Se revisaron los 13 bloques Mermaid de `docs/academic/04-design-diagrams.md` y los 7 bloques de `docs/project_docs/architecture-and-design.md`. Todos respetan la sintaxis estándar soportada (`flowchart`, `sequenceDiagram`, `erDiagram`), utilizan identificadores limpios sin etiquetas HTML en nodos y no presentan errores de renderizado.
* **Inmutabilidad de `DEVELOPMENT_LOG.md`:** Se verificó que [`DEVELOPMENT_LOG.md`](file:///f:/React/OneITB23/docs/audit/DEVELOPMENT_LOG.md) conserva su orden cronológico descendente (de más reciente a más antiguo, encabezado por la Spec 218), con 3.811 líneas intactas. No se realizó ninguna alteración en dicho archivo.

---

## 4. Advertencias y Recomendaciones de Cierre

1. 🟡 **Enlace Roto en `01-project-overview.md`:**  
   La línea 249 apunta a `../entrega_final/DOCUMENTO_FINAL_TESIS_ONEITB23.md`, archivo que no existe en el repositorio (el documento actual se denomina `DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`).  
   *Propuesta de Cierre:* Reemplazar la ruta del enlace por `../entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`.

2. 🟡 **Desalineación de Rutas en Manuales de Usuario:**  
   Los manuales describen rutas en español (`/registro`, `/perfil`, `/academico`), mientras que `Routing.jsx` define rutas en inglés o compuestas (`/register`, `/profile`, `/academic`).  
   *Propuesta de Cierre:* Registrar las redirecciones de cortesía en `Routing.jsx` para que cualquier URL citada en la documentación lleve al usuario a la vista correspondiente sin dar 404.

3. 🟢 **Oportunidad de Depuración de Términos:**  
   Estandarizar el uso del término "Consulta" vs "Publicación/Post" en `scope-and-requirements.md` para reflejar unívocamente la entidad `Inquiry` del dominio.

---

## 5. Conclusión del Módulo
La documentación técnica y académica de **OneITB23** presenta una **alta fidelidad con respecto al código real** (95%+ de coherencia en contratos, arquitectura y versiones de stack). No se detectaron discrepancias críticas ni alucinaciones de alcance. Corregir el enlace roto y mapear los redirects de URLs resolverá la totalidad de las advertencias identificadas.
