# GUÍA DE MAQUETACIÓN FINAL

**Proyecto:** OneITB23<br>
**Documento fuente:** `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`<br>
**Resultado esperado:** archivo `.docx` editable y archivo `.pdf` listo para presentar<br>
**Criterio editorial:** APA 7, sujeto a los requisitos particulares del Instituto Tecnológico Beltrán

> El documento Markdown es la fuente canónica. No debe reemplazarse ni editarse destructivamente durante la maquetación. Se recomienda trabajar sobre una copia y conservar los diagramas originales en formato Mermaid.

---

## 1. PREPARACIÓN Y HERRAMIENTAS

Todas las opciones indicadas en esta guía disponen de una modalidad completamente gratuita.

| Herramienta | Uso principal | Modalidad gratuita |
|---|---|---|
| [Visual Studio Code](https://code.visualstudio.com/) | Revisar el Markdown y abrir su vista previa | Aplicación gratuita para Windows, Linux y macOS |
| [Pandoc](https://pandoc.org/installing.html) | Convertir Markdown a `.docx` | Software libre y gratuito |
| [Mermaid Live Editor](https://mermaid.live/) | Renderizar y exportar los diagramas Mermaid | Aplicación web gratuita, sin cuenta obligatoria |
| [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) | Visualizar bloques Mermaid en versiones anteriores de VS Code | Extensión gratuita; desde VS Code 1.121 la función está integrada y no requiere esta extensión |
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

El documento contiene seis bloques Mermaid. Para evitar confusiones, exportarlos con estos nombres:

1. `01-infografia-interaccion-alumno.png`
2. `02-casos-de-uso.png`
3. `03-modelo-dominio-der.png`
4. `04-arquitectura-componentes.png`
5. `05-arquitectura-despliegue.png`
6. `06-calendarizacion-gantt.png`

Conservar además una copia `.svg` de cada diagrama como archivo maestro. El PNG se utiliza para maximizar la compatibilidad con editores y exportadores de Word.

---

## 2. GESTIÓN DE DIAGRAMAS MERMAID

Antes de convertir el documento, cada bloque comprendido entre ` ```mermaid ` y ` ``` ` debe transformarse en una imagen. La descripción exhaustiva ubicada debajo de cada diagrama debe conservarse: forma parte de la memoria técnica y permite interpretar el gráfico de manera accesible.

### Alternativa A: Renderizado y exportación rápida

**Recomendada cuando:** el diagrama Mermaid ya se ve correctamente y no requiere una identidad visual personalizada.

#### Opción A1: Mermaid Live Editor

1. Abrir [Mermaid Live Editor](https://mermaid.live/).
2. Copiar únicamente el contenido interno del primer bloque `mermaid`; no copiar las tres comillas invertidas.
3. Pegar el contenido en el panel **Code**.
4. Verificar que el panel de vista previa no muestre errores de sintaxis ni textos cortados.
5. Elegir un tema claro y de alto contraste para que el diagrama sea legible al imprimir.
6. Exportar primero como **SVG** y luego como **PNG**.
7. Guardar ambos archivos en `docs/entrega_final/diagramas/` con la nomenclatura de la sección 1.2.
8. Repetir el proceso para los seis bloques.

#### Opción A2: Vista previa local en VS Code

1. Abrir `DOCUMENTO_MAQUETACION.md` y presionar `Ctrl+Shift+V` para probar la vista previa Markdown integrada.
2. En VS Code 1.121 o posterior, Mermaid ya está integrado. No instalar extensiones adicionales.
3. Solo en una versión anterior que no renderice los bloques, instalar la extensión gratuita **Markdown Preview Mermaid Support**.
4. Confirmar que los seis diagramas se rendericen.
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
   - orientación vertical para infografía y casos de uso;
   - orientación horizontal para DER, componentes, despliegue y Gantt.
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

Usar Mermaid Live Editor y SVG/PNG para los diagramas técnicos. Reservar Draw.io para la infografía, el diagrama de casos de uso o cualquier gráfico que necesite iconos institucionales. La exactitud técnica debe prevalecer sobre la decoración.

### 2.1 Reemplazar los bloques Mermaid

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

---

## 3. CONVERSIÓN DE MARKDOWN A WORD (.docx)

La conversión debe ejecutarse sobre `DOCUMENTO_MAQUETACION.md`, después de reemplazar los seis bloques Mermaid. Pandoc no convierte automáticamente esos bloques en imágenes dentro de Word.

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
  --output=".\docs\entrega_final\salida\OneITB23_Practica_Profesionalizante_III.docx"
```

El equivalente mínimo es:

```powershell
pandoc ".\docs\entrega_final\DOCUMENTO_MAQUETACION.md" -o ".\docs\entrega_final\salida\OneITB23_Practica_Profesionalizante_III.docx"
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
  --output=".\docs\entrega_final\salida\OneITB23_Practica_Profesionalizante_III.docx"
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
7. Insertar manualmente las seis imágenes mediante **Insertar > Imagen**.
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
6. Aplicar el formato APA definido en la sección 2.1: número, título, imagen y nota.
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
- [ ] Las seis figuras están numeradas, tituladas, citadas en el texto y son legibles.
- [ ] Las tablas no se cortan y repiten su encabezado cuando ocupan más de una página.
- [ ] Todos los enlaces funcionan.
- [ ] No aparecen comentarios, control de cambios ni metadatos personales innecesarios.
- [ ] El corrector ortográfico está configurado en español.
- [ ] El PDF conserva acentos, símbolos, imágenes y numeración.
- [ ] El PDF fue revisado página por página al 100 % de zoom.
- [ ] Se conservaron el Markdown fuente, el `.docx`, el PDF y los archivos editables de los diagramas.

### Archivos finales sugeridos

```text
docs/entrega_final/
|-- DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md
|-- DOCUMENTO_MAQUETACION.md
|-- GUIA_MAQUETACION_FINAL.md
|-- diagramas/
|   |-- 01-infografia-interaccion-alumno.svg
|   |-- 01-infografia-interaccion-alumno.png
|   |-- ...
|   `-- 06-calendarizacion-gantt.png
`-- salida/
    |-- REFERENCIA_APA.docx
    |-- OneITB23_Practica_Profesionalizante_III.docx
    `-- OneITB23_Practica_Profesionalizante_III.pdf
```

El `.docx` debe considerarse el archivo de edición final; el PDF es la versión de entrega. El Markdown permanece como respaldo técnico reproducible.
