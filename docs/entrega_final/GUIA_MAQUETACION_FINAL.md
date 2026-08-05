# GUÍA DE MAQUETACIÓN FINAL

**Proyecto:** OneITB23<br>
**Documento fuente:** `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`<br>
**Resultado esperado:** archivo `.docx` editable y archivo `.pdf` listo para presentar<br>
**Versión de la guía:** 3.2 - procedimiento final alineado al corte documental del 5 de agosto de 2026<br>
**Inventario de la memoria:** 10 diagramas Mermaid y 3 gráficos de gestión para anexos<br>
**Paquete técnico complementario:** 13 vistas Mermaid en `docs/academic/04-design-diagrams.md`<br>
**Criterio editorial:** APA 7, sujeto a los requisitos particulares del Instituto Tecnológico Beltrán

> El documento Markdown es la fuente canónica. No debe reemplazarse ni editarse destructivamente durante la maquetación. Se recomienda trabajar sobre una copia y conservar los diagramas originales en formato Mermaid.

> **Estado de entrada (5 de agosto de 2026).** La memoria fuente está alineada con el
> Release Candidate académico: 117/117 ítems contabilizados (46 verificados y 71
> implementados), últimos baselines de 216 pruebas backend y 225 frontend por capa
> registrados en worktrees sucesivos, builds limpios, 34 migraciones, base demo canónica, acceso Microsoft Entra
> real hasta onboarding/muro, Redis local y SMTP Mailpit verificados. Ese corte no
> reemplaza el gate integral del SHA candidato definitivo. El alumno informó haber
> renderizado los 13 Mermaid del paquete técnico; su selección, inserción y revisión
> visual dentro del Word continúan siendo un gate editorial. Esta guía no debe utilizarse
> para declarar como productivos los proveedores externos pendientes.

---

## 1. PREPARACIÓN Y HERRAMIENTAS

Todas las opciones indicadas en esta guía disponen de una modalidad completamente gratuita.

| Herramienta | Uso principal | Modalidad gratuita |
|---|---|---|
| [Visual Studio Code](https://code.visualstudio.com/) | Revisar el Markdown y abrir su vista previa | Aplicación gratuita para Windows, Linux y macOS |
| [Pandoc](https://pandoc.org/installing.html) | Convertir Markdown a `.docx` | Software libre y gratuito |
| [Mermaid Live Editor](https://mermaid.live/) | Renderizar y exportar los diagramas Mermaid | Aplicación web gratuita, sin cuenta obligatoria |
| [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) | Visualizar bloques Mermaid cuando la vista previa instalada no los renderiza | Extensión gratuita y opcional; comprobar primero la vista previa nativa |
| [Draw.io / diagrams.net](https://app.diagrams.net/) | Recrear diagramas con control visual completo | Aplicación web gratuita |
| [LibreOffice Writer](https://www.libreoffice.org/download/download-libreoffice/) | Editar `.docx` y exportar a PDF sin licencia comercial | Suite de escritorio libre y gratuita |
| [Word para la Web](https://www.microsoft365.com/launch/word) | Editar `.docx` desde el navegador | Versión web gratuita con una cuenta Microsoft |

### 1.1 Preparar el espacio de trabajo

1. Abrir una terminal de PowerShell en la raíz del repositorio `OneITB23`.
2. Confirmar que el documento fuente existe:

```powershell
Test-Path ".\docs\entrega_final\DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md"
```

3. Crear carpetas separadas para diagramas y archivos exportados:

```powershell
New-Item -ItemType Directory -Force ".\docs\entrega_final\diagramas"
New-Item -ItemType Directory -Force ".\docs\entrega_final\salida"
```

4. Crear una copia de trabajo. El documento base debe permanecer intacto:

```powershell
Copy-Item `
  ".\docs\entrega_final\DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md" `
  ".\docs\entrega_final\DOCUMENTO_MAQUETACION.md"
```

5. Abrir `DOCUMENTO_MAQUETACION.md` en Visual Studio Code.
6. Instalar Pandoc y comprobar su disponibilidad:

```powershell
pandoc --version
```

### 1.2 Nomenclatura recomendada

El documento contiene diez bloques Mermaid en su cuerpo principal. Deben exportarse en este orden para que la numeración de figuras coincida con su aparición:

1. `01-infografia-interaccion-alumno.png`
2. `02-casos-uso-social-academico.png`
3. `03-casos-uso-bolsa-trabajo.png`
4. `04-casos-uso-administracion.png`
5. `05-secuencia-registro.png`
6. `06-secuencia-inicio-sesion.png`
7. `07-modelo-dominio-der.png`
8. `08-arquitectura-componentes.png`
9. `09-arquitectura-despliegue.png`
10. `10-calendarizacion-gantt.png`

Además, la sección 5 especifica tres gráficos de gestión que deben recrearse e incorporarse en los Anexos:

11. `11-cronograma-macro-2023-2026.png`
12. `12-calendario-scrum-dos-semanas.png`
13. `13-red-pert-ruta-critica.png`

Conservar una copia `.svg` de cada figura y el archivo `.drawio` de los gráficos recreados manualmente. El PNG se utiliza para maximizar la compatibilidad con editores y exportadores de Word; el SVG o `.drawio` permanece como fuente maestra editable.

> **No mezclar inventarios.** Los 13 Mermaid de `docs/academic/04-design-diagrams.md`
> constituyen un paquete técnico complementario: contexto, componentes, tres DER, cuatro
> secuencias/flujo y cuatro vistas de realtime/despliegue/operación. No sustituyen uno a
> uno las diez figuras enumeradas arriba. Para el cuerpo del Word se utiliza la lista
> `01` a `10` de esta guía; las vistas técnicas adicionales pueden incorporarse en anexos
> solo si conservan legibilidad y son citadas desde el texto.

El asset `docs/entrega_final/assets/oneitb-infografia.png` es una **pieza promocional
complementaria** ya preparada para la presentación o un anexo visual. No reemplaza la
Figura 1 técnica `01-infografia-interaccion-alumno.png`, no altera la numeración `01` a
`13` y debe insertarse solo si mantiene legibilidad y no duplica contenido. Se conserva
fuera de `src/assets` para evitar incorporarlo innecesariamente al bundle de la SPA.

### 1.3 Actualizaciones técnicas incorporadas

La versión actual del documento ya incluye las siguientes decisiones. No deben revertirse durante la maquetación:

| Actualización | Criterio de cierre |
|---|---|
| Líneas UML normalizadas | Los seis `flowchart` utilizan `curve: step`; no deben reaparecer curvas Bézier |
| Casos de uso modularizados | Se presentan tres vistas independientes: Social y Académica, Bolsa de Trabajo y Administración |
| Interacciones autenticadas | Se incorporaron secuencias separadas para registro e inicio de sesión |
| DER normalizado | Debe recrearse con notación Crow's Foot, relaciones ortogonales y nota XOR para `SOCIAL_ATTACHMENT` |
| Calendarización legible | El Gantt utiliza tema claro y documenta la ejecución abril-julio de 2026 |
| Metodología híbrida | Se justificó el ciclo Water-Scrum-Fall: diseño predictivo en 2023, pausa y construcción ágil en 2026 |
| Gestión para anexos | Se definieron Cronograma Macro, Calendario Scrum y Red PERT con ruta crítica |
| Rigor académico | Se agregaron citas y referencias APA para Cascada, Scrum y Water-Scrum-Fall |
| Cierre de autorización Spec 201 | Registro Student-only con dominio backend, Profesor acotado por carrera y perfil privado sin excepción Follow |
| Infraestructura verificable | Cadena SQL productiva externa sin trust bypass predeterminado y probes separados live/ready |

### 1.4 Plan de trabajo y tiempos realistas

Las estimaciones presuponen que el contenido técnico no sufrirá cambios funcionales y
que se dispone de una jornada sin interrupciones. Los identificadores corresponden al
plan de cierre de `docs/project_docs/ROADMAP.md`.

| Orden | ID | Trabajo | Estimación | Salida verificable |
|---:|---|---|---:|---|
| 1 | `DF-01` | Confirmar portada y datos institucionales precargados | 20-30 min | Nombre, mesa, fecha y versión revisados por el alumno |
| 2 | `DF-03` | Exportar los 10 diagramas Mermaid recomendados | 2-3 h | SVG y PNG numerados, legibles y sin errores |
| 3 | `DF-04` | Recrear DER, Cronograma Macro, Calendario Scrum y PERT | 4-6 h | 4 archivos editables y 4 exportaciones |
| 4 | `DF-05` | Crear documento de maquetación, DOCX e índice | 3-4 h | DOCX APA editable y completo |
| 5 | `DF-06` | Auditar, corregir y exportar PDF | 2-3 h | PDF revisado página por página |
| 6 | `DF-07` | Diseñar presentación PPTX/PDF | 2 h 30 min-4 h | Narrativa visual, demo guiada, evidencia y límites técnicos |
| 7 | `DF-08` | Preparar guion, contingencia y ensayos | 3-4 h | Dos ensayos; exposición base de 22-25 min dentro del rango oficial de 20-30 min |

El tiempo académico pendiente es de **16 h 50 min a 24 h 30 min**. Debe reservarse
además el bloque técnico `CF-01` a `CF-06`; el cierre completo requiere aproximadamente
**23 h 35 min a 34 h efectivas**, distribuidas en cuatro jornadas concentradas.

**Ruta crítica documental:** `DF-01 -> DF-03/DF-04 -> DF-05 -> DF-06 -> DF-07 -> DF-08`.
Los diagramas Mermaid y los cuatro gráficos manuales pueden producirse en paralelo.

### 1.5 Orden de congelamiento y aprobación

No avanzar por fecha solamente. Cada gate debe estar aprobado antes de producir el
siguiente artefacto:

| Gate | Condición de entrada | Evidencia de salida |
|---|---|---|
| A. Contenido | Memoria Markdown normalizada | Portada confirmada, cifras contrastadas y `git diff` documental revisado |
| B. Figuras | Gate A aprobado | 13 figuras numeradas, legibles a tamaño A4, con fuentes editables y control en escala de grises |
| C. DOCX | Gates A y B aprobados | Índice actualizado, estilos APA, tablas/figuras estables y ausencia de instrucciones editoriales |
| D. PDF e imprenta | Gate C aprobado | PDF auditado en cuatro pasadas, hash SHA-256, copia abierta en otro equipo y orden de impresión autorizado |

La fecha objetivo para enviar el material a imprenta es el **4 de agosto de 2026**. Si
un gate no puede cerrarse, se debe reducir decoración o cantidad de láminas auxiliares,
pero nunca omitir la revisión de contenido, el DER, la arquitectura ni el PDF final.

---

## 2. GESTIÓN DE DIAGRAMAS MERMAID

Antes de convertir el documento, cada uno de los diez bloques comprendidos entre ` ```mermaid ` y ` ``` ` debe transformarse en una imagen. La descripción exhaustiva ubicada debajo de cada familia de diagramas debe conservarse: forma parte de la memoria técnica, aporta accesibilidad y permite reconstruir el gráfico sin depender del renderizador.

### Alternativa A: Renderizado y exportación rápida

**Recomendada cuando:** el diagrama Mermaid ya se ve correctamente y no requiere una identidad visual personalizada.

#### Opción A1: Mermaid Live Editor

1. Abrir [Mermaid Live Editor](https://mermaid.live/).
2. Copiar únicamente el contenido interno del primer bloque `mermaid`; no copiar las tres comillas invertidas. Incluir siempre la directiva `%%{init...}%%` cuando exista.
3. Pegar el contenido en el panel **Code**.
4. Verificar que el panel de vista previa no muestre errores de sintaxis, textos cortados, conectores superpuestos ni curvas en los `flowchart`.
5. Elegir un tema claro y de alto contraste. El Gantt debe conservar `theme: default`; las secuencias deben mantener legibles las activaciones, notas y ramas `alt`.
6. Exportar primero como **SVG** y luego como **PNG**.
7. Guardar ambos archivos en `docs/entrega_final/diagramas/` con la nomenclatura de la sección 1.2.
8. Repetir el proceso para los diez bloques Mermaid.
9. No corregir el DER dentro de Mermaid: utilizarlo como inventario lógico y recrearlo en Draw.io conforme a Crow's Foot.

#### Opción A2: Vista previa local en VS Code

1. Abrir `DOCUMENTO_MAQUETACION.md` y presionar `Ctrl+Shift+V` para probar la vista previa Markdown integrada.
2. Comprobar primero si la instalación actual renderiza Mermaid sin extensiones.
3. Solo si la vista previa no lo soporta, instalar **Markdown Preview Mermaid Support**.
4. Confirmar que los diez diagramas se rendericen sin errores ni textos truncados.
5. Para una exportación limpia, copiar cada bloque a Mermaid Live Editor y descargarlo. Usar una captura solamente como último recurso.
6. Si se realiza una captura, configurar el zoom del sistema al 100 %, ampliar el diagrama y evitar que aparezcan menús, cursores o fondos del editor.

**Ventajas:**

- Es el procedimiento más rápido.
- Mantiene correspondencia directa entre el código Mermaid y el gráfico.
- El SVG conserva nitidez independientemente del tamaño.

**Desventajas:**

- Ofrece menos control sobre colores, iconos y alineaciones finas.
- Los diagramas muy anchos pueden requerir orientación horizontal o una exportación a mayor resolución.

### Alternativa B: Recreación manual para máximo control

**Recomendada cuando:** la institución exige colores específicos, iconos institucionales o un acabado visual uniforme entre todos los gráficos.

1. Abrir [Draw.io / diagrams.net](https://app.diagrams.net/).
2. Elegir almacenamiento local mediante **Device** para no depender de una cuenta externa.
3. Crear un archivo por diagrama con página A4:
   - orientación vertical para las secuencias cuando conserven una anchura legible;
   - orientación horizontal para infografía, casos de uso, DER, componentes, despliegue, Gantt, Cronograma Macro y Red PERT;
   - orientación según prueba de impresión para el Calendario Scrum.
4. Leer la **Descripción descriptiva exhaustiva** correspondiente en el documento base.
5. Crear todos los nodos, grupos y conexiones indicados en esa descripción.
6. Mantener una paleta institucional consistente, por ejemplo:
   - azul principal: `#1D4ED8`;
   - azul oscuro: `#0F172A`;
   - celeste de apoyo: `#DBEAFE`;
   - gris de fondo: `#F8FAFC`;
   - texto: `#1E293B`.
7. Utilizar una única familia tipográfica y un tamaño mínimo equivalente a 10 puntos en la impresión final.
8. Agregar una leyenda cuando los colores expresen roles, capas o estados diferentes.
9. Exportar el archivo editable `.drawio`, un maestro `.svg` y un `.png` con escala de 2x o ancho aproximado de 2000 a 2400 píxeles.
10. Guardar las exportaciones en `docs/entrega_final/diagramas/`.

**Ventajas:**

- Permite controlar colores, alineación, iconografía y jerarquía visual.
- Produce gráficos coherentes con una identidad institucional.
- El archivo `.drawio` continúa siendo editable.

**Desventajas:**

- Requiere más tiempo y revisión manual.
- Existe riesgo de introducir diferencias respecto del modelo técnico original.

### Criterio recomendado para OneITB23

Usar Mermaid Live Editor y SVG/PNG para la infografía, los tres casos de uso, las dos secuencias, componentes, despliegue y Gantt. Recrear el DER en Draw.io para aplicar Crow's Foot y relaciones ortogonales con control preciso. Utilizar también Draw.io para los tres gráficos de gestión de anexos. La exactitud técnica, la legibilidad impresa y la trazabilidad deben prevalecer sobre la decoración.

### 2.1 Controles UML y visuales obligatorios

| Familia | Control requerido antes de exportar |
|---|---|
| Infografía y arquitectura | Conservar `curve: step`; las conexiones deben ser rectas u ortogonales y no deben cruzar títulos ni nodos |
| Casos de uso | Mantener tres vistas; actores fuera del límite del sistema, casos de uso ovalados y asociaciones sin punta en la versión UML manual |
| Secuencias | Respetar el orden vertical, activaciones, llamadas continuas, respuestas discontinuas y fragmento `alt` del login |
| DER | Aplicar Crow's Foot, distinguir PK/FK, agrupar por dominios y representar el propietario XOR de `SOCIAL_ATTACHMENT` |
| Componentes | Separar cliente, entrada, API y persistencia; las flechas indican dependencias, no secuencia temporal |
| Despliegue | Diferenciar host, contenedores, volúmenes, servicios externos y flujo HTTPS; no representar secretos |
| Gantt | Mantener tema claro `default`, fechas visibles y página horizontal |

Controles comunes:

1. Evitar curvas, sombras intensas, fondos oscuros y degradados que pierdan contraste al imprimir.
2. Utilizar una sola tipografía sans serif dentro de los gráficos.
3. Mantener un tamaño mínimo equivalente a 10 puntos en el PDF final.
4. Evitar cruces de líneas; cuando sean inevitables, reorganizar nodos antes de agregar conectores decorativos.
5. Conservar la dirección lógica de cada flecha y no invertir relaciones para mejorar únicamente la estética.
6. Probar cada figura a color y en escala de grises.
7. Verificar que siglas, tildes, nombres de roles y tecnologías coincidan con el documento.

### 2.2 Gráficos de gestión para anexos

Los gráficos 11 a 13 no tienen un bloque Mermaid embebido. Deben construirse a partir de las descripciones hiperdetalladas de la sección 5:

1. **Cronograma Macro:** cuatro fases entre `Q1 2023` y `Q3 2026`, con el standby claramente diferenciado y un hito final de defensa.
2. **Calendario Scrum:** grilla de dos semanas por cinco días, ceremonias con duración, actividades técnicas y marcador de incremento.
3. **Red PERT:** nodos con Inicio Temprano, Fin Temprano y duración. La ruta crítica `A -> B -> C -> D -> E -> G -> H` debe destacarse en rojo; la rama `D -> F -> G` debe mostrar dos semanas de holgura.

En `DOCUMENTO_MAQUETACION.md`, insertar estas tres figuras bajo un nuevo apartado
`7.10 Gráficos de gestión del proyecto`. La numeración 7.9 ya pertenece a las condiciones
oficiales de presentación y no debe reutilizarse. La descripción técnica permanece en
la sección 5 y las láminas de mayor tamaño se concentran en Anexos para no interrumpir
la lectura principal.

### 2.3 Reemplazar los bloques Mermaid

En `DOCUMENTO_MAQUETACION.md`, reemplazar cada bloque de código Mermaid por una figura Markdown. Ejemplo:

```markdown
**Figura 1**

*Interacción del alumno con la comunidad OneITB*

![Flujo de interacción entre alumno, docentes, comunidad y empresas](diagramas/01-infografia-interaccion-alumno.png)

*Nota.* Elaboración propia a partir de la arquitectura de OneITB23.
```

Reglas para todas las figuras:

1. Numerarlas según su orden de aparición.
2. Escribir **Figura N** en negrita.
3. Colocar el título en cursiva sobre la imagen.
4. Agregar texto alternativo descriptivo.
5. Añadir debajo una nota de elaboración propia cuando corresponda.
6. Conservar la descripción exhaustiva que sigue a la figura.
7. Mencionar cada figura en el texto antes de su aparición.
8. Mantener numeración continua del 1 al 13, incluida la serie ubicada en Anexos.
9. No incluir el código Mermaid visible en la versión Word/PDF destinada a evaluación.

---

## 3. CONVERSIÓN DE MARKDOWN A WORD (.docx)

La conversión debe ejecutarse sobre `DOCUMENTO_MAQUETACION.md`, después de reemplazar
los diez bloques Mermaid e insertar los tres gráficos de gestión en el apartado 7.10 de
Anexos. Pandoc no convierte automáticamente los bloques Mermaid en imágenes dentro de
Word.

### Alternativa A: Método automatizado con Pandoc

**Recomendada cuando:** se desea conservar automáticamente títulos, listas, tablas, enlaces y jerarquía del documento.

#### Conversión básica

Desde la raíz del repositorio, ejecutar:

```powershell
pandoc `
  ".\docs\entrega_final\DOCUMENTO_MAQUETACION.md" `
  --from=gfm `
  --to=docx `
  --standalone `
  --toc `
  --toc-depth=3 `
  --resource-path=".\docs\entrega_final" `
  --output=".\docs\entrega_final\salida\OneITB23_Memoria_Tecnica_PP3_2026_v2.1.docx"
```

El equivalente mínimo es:

```powershell
pandoc ".\docs\entrega_final\DOCUMENTO_MAQUETACION.md" -o ".\docs\entrega_final\salida\OneITB23_Memoria_Tecnica_PP3_2026_v2.1.docx"
```

#### Conversión profesional con documento de referencia

Pandoc puede reutilizar estilos, márgenes, encabezados y pies de página de un `.docx` de referencia.

1. Generar una plantilla base:

```powershell
pandoc `
  -o ".\docs\entrega_final\salida\REFERENCIA_APA.docx" `
  --print-default-data-file reference.docx
```

2. Abrir `REFERENCIA_APA.docx` en LibreOffice Writer o Word para la Web.
3. Configurar los estilos `Normal`, `Body Text`, `Title`, `Heading 1`, `Heading 2`, `Heading 3` y `Bibliography` según la sección 4.
4. Guardar el archivo sin agregar contenido.
5. Ejecutar la conversión definitiva:

```powershell
pandoc `
  ".\docs\entrega_final\DOCUMENTO_MAQUETACION.md" `
  --from=gfm `
  --to=docx `
  --standalone `
  --toc `
  --toc-depth=3 `
  --resource-path=".\docs\entrega_final" `
  --reference-doc=".\docs\entrega_final\salida\REFERENCIA_APA.docx" `
  --output=".\docs\entrega_final\salida\OneITB23_Memoria_Tecnica_PP3_2026_v2.1.docx"
```

6. Abrir el resultado y actualizar la tabla de contenido completa para recalcular títulos y páginas.

**Ventajas:**

- Automatiza la estructura principal.
- Mantiene tablas, enlaces y niveles de títulos con mayor consistencia.
- Permite repetir la exportación si cambia el documento fuente.

**Desventajas:**

- Requiere instalar Pandoc.
- La portada, los saltos de página y algunas tablas deben revisarse manualmente.
- Los diagramas deben haberse convertido previamente en imágenes.

### Alternativa B: Método de copiado estructurado

**Recomendada cuando:** se prefiere controlar visualmente cada sección o no se desea instalar Pandoc.

1. Abrir `DOCUMENTO_MAQUETACION.md` en Visual Studio Code.
2. Presionar `Ctrl+Shift+V` para abrir la vista previa renderizada.
3. Crear un documento vacío en LibreOffice Writer o Word para la Web.
4. Copiar el documento por secciones desde la vista previa, no todo de una vez.
5. Pegar conservando el formato de origen.
6. Asignar explícitamente los estilos:
   - título principal: `Título`;
   - secciones numeradas: `Título 1`;
   - subsecciones: `Título 2`;
   - apartados menores: `Título 3`;
   - desarrollo: `Texto del cuerpo` o `Normal`.
7. Insertar manualmente las diez imágenes correspondientes a Mermaid y las tres láminas de gestión mediante **Insertar > Imagen**.
8. Volver a aplicar las leyendas y notas de cada figura.
9. Insertar una tabla de contenido automática basada en los estilos de título.

**Ventajas:**

- No requiere herramientas adicionales fuera del editor y la suite ofimática.
- Permite revisar el aspecto visual mientras se incorpora cada sección.

**Desventajas:**

- Es más lento y propenso a inconsistencias.
- El copiado puede introducir tamaños, espacios o fuentes diferentes.
- Las tablas y los enlaces requieren una revisión individual.

---

## 4. APLICACIÓN ESTRICTA DE NORMAS APA 7 EN WORD

Estas reglas deben aplicarse al `.docx` resultante. Si la plantilla oficial del Instituto Tecnológico Beltrán establece una condición diferente, la exigencia institucional prevalece y la excepción debe mantenerse de forma consistente.

### 4.1 Configurar la página

1. Seleccionar papel **A4**.
2. Establecer márgenes de **2,54 cm** en los cuatro lados.
3. Mantener orientación vertical para el documento.
4. Usar orientación horizontal solo en páginas aisladas donde un DER o diagrama técnico resulte ilegible en vertical.
5. Insertar el número de página en el margen superior derecho.
6. Evitar encabezados decorativos, bordes de página y fondos de color salvo exigencia institucional.

### 4.2 Configurar tipografía y estilos

Elegir una sola combinación y mantenerla en todo el documento:

- **Times New Roman, 12 puntos**, o
- **Arial, 11 puntos**.

Procedimiento:

1. Modificar el estilo `Normal` o `Texto del cuerpo`.
2. Asignar la fuente elegida.
3. Establecer alineación a la izquierda. No justificar si la institución no lo exige.
4. Configurar interlineado **doble (2,0)**.
5. Establecer espaciado anterior y posterior en **0 puntos** para los párrafos de desarrollo.
6. Evitar líneas en blanco utilizadas manualmente para separar párrafos.
7. Modificar los estilos `Título 1`, `Título 2` y `Título 3` sin alterar la numeración institucional de las secciones.

### 4.3 Sangría de los párrafos

1. Seleccionar los párrafos narrativos de desarrollo.
2. Abrir las opciones avanzadas de **Párrafo**.
3. Elegir **Sangría especial > Primera línea**.
4. Establecer **1,27 cm**.
5. No aplicar esta sangría a:
   - títulos y subtítulos;
   - tablas y leyendas de figuras;
   - citas en bloque;
   - entradas de la bibliografía;
   - listas con viñetas o numeración.

### 4.4 Sangría francesa en referencias

1. Ir a `8. REFERENCIAS BIBLIOGRÁFICAS`.
2. Seleccionar solamente las referencias, sin incluir el título de la sección ni la nota editorial.
3. Abrir las opciones de **Párrafo**.
4. Elegir **Sangría especial > Francesa**.
5. Establecer **1,27 cm**.
6. Mantener interlineado doble y cero puntos de espacio adicional entre referencias.
7. Verificar que la lista permanezca en orden alfabético y sin viñetas ni numeración.
8. Confirmar que las URL funcionen y no terminen con signos de puntuación ajenos al enlace.

### 4.5 Insertar y revisar figuras

1. Eliminar del documento final cualquier bloque de código Mermaid residual.
2. Insertar los PNG exportados en el lugar correspondiente.
3. Conservar los SVG y archivos `.drawio` como fuentes editables, aunque no se inserten en Word.
4. Mantener cada imagen dentro de los márgenes y bloquear su relación de aspecto.
5. No estirar una imagen de manera independiente en ancho y alto.
6. Aplicar el formato APA definido en la sección 2.3: número, título, imagen y nota.
7. Activar la opción **Mantener con el siguiente** para que el número y el título no queden separados de la figura.
8. Agregar texto alternativo a cada imagen para mejorar la accesibilidad.
9. Comprobar la legibilidad al 100 % de zoom y en una impresión de prueba.

### 4.6 Portada, índice y saltos

1. Completar la portada con los datos oficiales requeridos por la institución: título, estudiante, carrera, asignatura, docente y fecha.
2. Insertar un salto de página después de la portada.
3. Colocar la tabla de contenido en una página propia.
4. Actualizar la tabla completa después de cualquier cambio de títulos o paginación.
5. Usar saltos de página reales; no acumular líneas vacías.
6. Evitar títulos aislados al final de una página mediante las opciones **Mantener con el siguiente** y **Control de líneas viudas y huérfanas**.
7. Revisar que tablas y figuras no se corten entre páginas.

### 4.7 Exportar a PDF

#### Opción A: Exportación desde el editor

- En LibreOffice Writer: **Archivo > Exportar como > Exportar como PDF**.
- En Word para la Web: **Archivo > Guardar como > Descargar como PDF**.

**Ventaja:** conserva enlaces y estructura con mayor fidelidad.<br>
**Desventaja:** cualquier defecto del `.docx` también aparecerá en el PDF.

#### Opción B: Impresión virtual a PDF

1. Elegir **Archivo > Imprimir**.
2. Seleccionar una impresora PDF del sistema, por ejemplo **Microsoft Print to PDF**.
3. Usar papel A4 y escala del 100 %.

**Ventaja:** reproduce con precisión la salida de impresión.<br>
**Desventaja:** puede perder marcadores de navegación, enlaces internos o metadatos.

La opción A es la recomendada para la entrega digital. La opción B resulta útil como control de impresión.

### 4.8 Lista de control final

Antes de entregar, comprobar:

- [ ] La portada contiene datos personales e institucionales correctos.
- [ ] El índice coincide con los títulos y números de página.
- [ ] El documento usa A4 y márgenes de 2,54 cm.
- [ ] La fuente y el tamaño son uniformes.
- [ ] Los párrafos tienen interlineado doble y sangría de primera línea de 1,27 cm.
- [ ] Las referencias tienen sangría francesa de 1,27 cm.
- [ ] No quedan bloques `mermaid`, rutas locales ni instrucciones editoriales visibles.
- [ ] Las trece figuras están numeradas, tituladas, citadas en el texto y son legibles.
- [ ] Los seis `flowchart` usan conexiones ortogonales sin curvas Bézier.
- [ ] Los casos de uso permanecen divididos en tres módulos y sin cruces innecesarios.
- [ ] Las secuencias conservan activaciones, respuestas discontinuas y la alternativa del login.
- [ ] El DER utiliza Crow's Foot, PK/FK visibles y la restricción XOR de adjuntos.
- [ ] El Gantt conserva contraste claro y la Red PERT destaca correctamente la ruta crítica.
- [ ] Water-Scrum-Fall, Cascada y Scrum tienen su cita y referencia bibliográfica correspondiente.
- [ ] Las tablas no se cortan y repiten su encabezado cuando ocupan más de una página.
- [ ] Todos los enlaces funcionan.
- [ ] No aparecen comentarios, control de cambios ni metadatos personales innecesarios.
- [ ] El corrector ortográfico está configurado en español.
- [ ] Cada figura tiene texto alternativo y una nota de elaboración propia cuando corresponde.
- [ ] Las imágenes mantienen nitidez al 100 % y no fueron deformadas al redimensionarlas.
- [ ] El PDF conserva acentos, símbolos, imágenes y numeración.
- [ ] El PDF fue revisado página por página al 100 % de zoom.
- [ ] Se conservaron el Markdown fuente, el `.docx`, el PDF y los archivos editables de los diagramas.

### 4.9 Auditoría final en cuatro pasadas

No intentar revisar todo simultáneamente. Ejecutar cuatro recorridos independientes:

1. **Contenido y trazabilidad:** comparar títulos, requisitos, cifras, nombres de módulos, citas y referencias contra `DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`. La maquetación no debe introducir funcionalidades ni cambiar afirmaciones técnicas.
2. **UML y gráficos:** comprobar conectores, cardinalidades, actores, límites de sistema, secuencias, ruta crítica y correspondencia entre cada figura y su descripción exhaustiva.
3. **APA y edición:** revisar portada, jerarquía de títulos, tipografía, interlineado, sangrías, figuras, tablas, citas y bibliografía.
4. **PDF y defensa:** revisar página por página, probar enlaces, buscar texto, verificar índice, marcadores, calidad de imágenes, peso del archivo y legibilidad proyectada en pantalla.

Usar nombres de entrega estables, por ejemplo:

```text
OneITB23_Memoria_Tecnica_PP3_2026_v2.1.docx
OneITB23_Memoria_Tecnica_PP3_2026_v2.1.pdf
```

Evitar nombres como `final_final`, `nuevo`, `corregido2` o equivalentes. Después de aprobar el PDF, generar una huella de integridad:

```powershell
Get-FileHash `
  ".\docs\entrega_final\salida\OneITB23_Memoria_Tecnica_PP3_2026_v2.1.pdf" `
  -Algorithm SHA256 |
  Format-List |
  Out-File ".\docs\entrega_final\salida\OneITB23_Memoria_Tecnica_PP3_2026_v2.1.sha256.txt"
```

La huella no necesita adjuntarse salvo solicitud institucional; se conserva como evidencia de que el archivo revisado coincide con el archivo entregado.

### 4.10 Preflight de imprenta

Antes de enviar el PDF:

1. Abrirlo en un segundo visor y, si es posible, en otro equipo.
2. Confirmar tamaño A4, orientación correcta de páginas especiales y ausencia de hojas
   en blanco no intencionales.
3. Verificar que las fuentes estén incrustadas o sustituidas de forma consistente desde
   las propiedades del PDF.
4. Revisar las figuras al 200 %: no deben pixelarse, cortarse ni invadir márgenes.
5. Imprimir dos páginas de muestra: una con texto/tablas y otra con el DER o una figura
   compleja. Comprobar contraste tanto a color como en escala de grises.
6. Confirmar con la imprenta: impresión preferentemente a color, simple o doble faz,
   gramaje disponible, tipo de tapa, anillado o encuadernación y hora de retiro.
7. Enviar exclusivamente el PDF cuyo SHA-256 fue registrado; no enviar el DOCX como
   fuente de impresión porque puede repaginarse en otro equipo.
8. Al retirar la copia, verificar portada, orientación, orden de páginas, encuadernación
   y legibilidad de al menos tres figuras antes de abandonar la imprenta.

La elección entre simple y doble faz no fue fijada por la cátedra. Debe decidirse por
legibilidad, espesor y recomendación de la imprenta, sin alterar márgenes ni numeración.

### Archivos finales sugeridos

```text
docs/entrega_final/
|-- DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md
|-- DOCUMENTO_MAQUETACION.md
|-- GUIA_MAQUETACION_FINAL.md
|-- diagramas/
|   |-- 01-infografia-interaccion-alumno.svg
|   |-- 01-infografia-interaccion-alumno.png
|   |-- 02-casos-uso-social-academico.png
|   |-- 03-casos-uso-bolsa-trabajo.png
|   |-- 04-casos-uso-administracion.png
|   |-- 05-secuencia-registro.png
|   |-- 06-secuencia-inicio-sesion.png
|   |-- 07-modelo-dominio-der.drawio
|   |-- 07-modelo-dominio-der.png
|   |-- 08-arquitectura-componentes.png
|   |-- 09-arquitectura-despliegue.png
|   |-- 10-calendarizacion-gantt.png
|   |-- 11-cronograma-macro-2023-2026.drawio
|   |-- 11-cronograma-macro-2023-2026.png
|   |-- 12-calendario-scrum-dos-semanas.drawio
|   |-- 12-calendario-scrum-dos-semanas.png
|   |-- 13-red-pert-ruta-critica.drawio
|   `-- 13-red-pert-ruta-critica.png
`-- salida/
    |-- REFERENCIA_APA.docx
    |-- OneITB23_Memoria_Tecnica_PP3_2026_v2.1.docx
    |-- OneITB23_Memoria_Tecnica_PP3_2026_v2.1.pdf
    `-- OneITB23_Memoria_Tecnica_PP3_2026_v2.1.sha256.txt
```

El `.docx` debe considerarse el archivo de edición final; el PDF es la versión de entrega. El Markdown permanece como respaldo técnico reproducible.

---

## 5. CIERRE, ENTREGA Y DEFENSA

### 5.1 Condiciones oficiales de la mesa

La mesa comienza el **viernes 7 de agosto de 2026 a las 09:00**. El aula o laboratorio
se confirmará ese mismo día. La instancia incluye exposición, demostración funcional y
preguntas. La duración oficial de la exposición es de **20 a 30 minutos** y puede
extenderse por las preguntas o por la cantidad de integrantes.

La cátedra confirmó los siguientes requisitos:

1. llevar una presentación en PowerPoint, PDF o formato equivalente;
2. entregar **una copia impresa** de la documentación técnica, preferentemente a color,
   anillada o encuadernada;
3. disponer del sistema, documentación y presentación en formato digital;
4. mantener actualizado y disponible el repositorio;
5. llevar notebook propia con el sistema instalado, configurado y probado, aunque exista
   una computadora institucional;
6. llevar adaptador HDMI compatible porque la disponibilidad institucional no está
   garantizada;
7. llevar un pendrive de contingencia que no deberá entregarse.

El Manual de Usuario no constituye un entregable separado: está integrado en la sección
6 de `DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`, conforme a la indicación del presidente
de mesa. No existe otra plantilla institucional obligatoria.

Como recomendación operativa, llegar entre las **08:15 y las 08:30** para identificar
el aula, conectar el equipo y comprobar proyección y audio antes del inicio.

### 5.2 Paquete mínimo entregable

El paquete académico se considera completo cuando contiene:

1. una copia impresa, preferentemente a color, anillada o encuadernada, de la memoria aprobada;
2. `OneITB23_Memoria_Tecnica_PP3_2026_v2.1.docx`, editable y sin comentarios;
3. `OneITB23_Memoria_Tecnica_PP3_2026_v2.1.pdf`, idéntico al DOCX aprobado;
4. presentación `OneITB23_Defensa_2026.pptx` y su exportación PDF;
5. las 13 figuras en formato de entrega y sus fuentes editables;
6. el Markdown canónico utilizado para producir el documento;
7. el archivo SHA-256 del PDF revisado;
8. un archivo o lámina breve con el SHA del código presentado, versión del sistema y
   fecha del último gate.

No incluir en el paquete contraseñas demo, secretos, cadenas de conexión, archivos
`.env`, buzones SMTP capturados ni datos personales que no sean necesarios.

### 5.3 Control de coherencia con el software

Antes de congelar el DOCX, contrastar como mínimo estas afirmaciones:

| Afirmación documental | Fuente de comprobación |
|---|---|
| 100 % global y 117/117 ítems | `docs/project_docs/ROADMAP.md` |
| 216 pruebas backend y 225 frontend como últimos baselines por capa; repetición conjunta pendiente sobre SHA definitivo | Specs 205/212, `DEVELOPMENT_LOG.md` y `DOCUMENTATION_STATUS.md` |
| EF Core sin drift | salida del gate de predefensa |
| Backup, 34 migraciones, seed doble y seis roles | evidencia de Spec 196, Runbook y auditoría final |
| 47 mutaciones GraphQL en el schema vigente | arquitectura, auditoría final y schema generado |
| Redis local y SMTP Mailpit verificados | evidencia de Spec 195 |
| Microsoft Entra aceptado hasta onboarding/muro; cierre integral pendiente | Roadmap y auditoría final |
| Carrera estudiantil única y alcance coherente | Spec 214, arquitectura y memoria; explicar `SelfDeclared` y separar el mock SIU de calificaciones |
| Feature Complete core | Roadmap, sin reinterpretar P5/P6 como deuda académica |
| Release Candidate académico | sección 7.8 de la memoria |

Si una nueva ejecución cambia una cifra, actualizar primero el Roadmap y la evidencia,
después la memoria y por último el DOCX/PDF. Nunca corregir solo el archivo Word.

### 5.4 Ensayo técnico de la defensa

La duración oficial es de **20 a 30 minutos**. Preparar un recorrido interno de
**22 a 25 minutos** para conservar margen de transición y evitar excederse antes de las
preguntas:

1. **Problema institucional y objetivo (2 min):** fragmentación académica y propuesta
   OneITB23.
2. **Alcance, actores y módulos (2 min):** roles, límites y recorrido general.
3. **Arquitectura y seguridad (3 min):** React/Apollo, GraphQL/Hot Chocolate, EF
   Core/SQL Server, autenticación y
   adaptadores externos.
4. **Demostración funcional (10-12 min):** identidad, muro multimedia, módulo académico,
   chat/notificaciones, moderación y Bolsa de Trabajo.
5. **Calidad y evidencia (3 min):** autorización declarativa, uploads, paginación,
   aislamiento de sesión, pruebas y auditoría.
6. **Estado y evolución (2 min):** Release Candidate académico, gates externos y
   próximos pasos.

Ejecutar al menos un ensayo con cronómetro y otro utilizando únicamente el material de
respaldo. La demostración debe poder continuar si falla Internet.

### 5.5 Plan de contingencia

Preparar la notebook propia con cargador y adaptador HDMI. La computadora institucional
se considera respaldo y no entorno principal. Conservar localmente y en un pendrive, en
una carpeta separada de los secretos:

- PDF final y una copia en almacenamiento removible;
- presentación en PPTX y PDF;
- capturas de los flujos por rol;
- evidencia resumida de tests/builds;
- exportación de los diagramas;
- instrucciones para restaurar Docker SQL y ejecutar el seeder;
- salida sanitizada de `scripts/validate-demo-database.ps1`;
- una copia del commit o tag presentado;
- snapshot offline del repositorio.

Estructura recomendada:

```text
OneITB23_Defensa/
|-- Presentacion/
|   |-- OneITB23_Defensa_2026.pptx
|   `-- OneITB23_Defensa_2026.pdf
|-- Documentacion/
|   |-- OneITB23_Memoria_Tecnica_PP3_2026.pdf
|   `-- OneITB23_Memoria_Tecnica_PP3_2026.docx
|-- Evidencia/
|   |-- resumen-validaciones.pdf
|   `-- capturas-demo/
|-- Repositorio/
|   `-- OneITB23-source.zip
`-- LEEME_DEFENSA.txt
```

No depender de la disponibilidad externa de Microsoft Entra, SMTP público, Cloudinary ni
Redis administrado durante la defensa. La demo controlada debe utilizar cuentas locales,
fallbacks y contenedores ya verificados. El pendrive no se entrega y no debe contener `.env`, secretos, contraseñas,
tokens, cadenas de conexión ni datos personales innecesarios.

El día anterior y nuevamente en el equipo que se llevará a la mesa, ejecutar
`scripts/validate-demo-database.ps1`. Conservar el backup verificado en la notebook,
pero **no** copiar archivos `.bak` al pendrive académico ni al repositorio: pueden
contener datos y hashes locales. La contingencia debe apoyarse en el runbook, el código,
las migraciones y capturas de la demostración, no en distribuir la base.

### 5.6 Definition of Done documental

- [ ] Portada e información institucional completadas.
- [ ] Trece figuras exportadas, numeradas y revisadas.
- [ ] DER y gráficos de gestión conservan fuentes editables.
- [ ] Documento de maquetación generado desde el Markdown canónico.
- [ ] DOCX validado con estilos APA 7 e índice actualizado.
- [ ] PDF revisado en las cuatro pasadas y sin instrucciones editoriales visibles.
- [ ] Gates A-D aprobados en orden y sin cambios posteriores sobre una fuente ya congelada.
- [ ] Cifras de pruebas, estado y pendientes coinciden con el Roadmap.
- [ ] SHA-256 del PDF generado después de la última corrección.
- [ ] PDF abierto en un segundo equipo y páginas de muestra verificadas antes del tiraje completo.
- [ ] Una copia impresa, preferentemente a color, anillada o encuadernada, preparada para la mesa.
- [ ] Presentación disponible en PPTX y PDF.
- [ ] Notebook, cargador y adaptador HDMI probados.
- [ ] SQL Docker saludable y `scripts/validate-demo-database.ps1` en PASS con seis roles.
- [ ] Pendrive verificado, sin secretos y con sistema, documentación, presentación y snapshot.
- [ ] Repositorio remoto actualizado y corte presentado identificado por SHA.
- [ ] Ensayo cronometrado de 22-25 minutos realizado dentro del rango oficial de 20-30.
- [ ] Llegada planificada para las 08:15-08:30; aula y equipamiento se confirman ese día.
- [ ] Límites externos y plan de contingencia explicados correctamente.

Solo después de completar esta lista debe utilizarse la palabra **final** en el nombre
del paquete institucional.
