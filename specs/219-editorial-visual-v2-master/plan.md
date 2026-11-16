# Implementation Plan: Spec 219 - Normalización Editorial, Artefactos Visuales y Memoria Técnica v2.0 Oficial (2026)

## 1. Arquitectura de la Solución Editorial

La generación de la Memoria Técnica v2.0 para imprenta implementa una arquitectura modular que separa **fuentes maestras (Markdown + diagramas textuales MMD)** de los **artefactos de salida (DOCX y PDF)**:

```
[Markdown Canónico v2.3]  +  [Diagramas MMD Desacoplados]  +  [Assets Visuales / Logos]
               │                         │                              │
               └─────────────────────────┼──────────────────────────────┘
                                         ▼
                            [Preprocesador Node.js]
                     (Inyección de figuras APA 7, tablas con bordes)
                                         │
                                         ▼
                               [Pandoc 3.10 CLI]
                    (Plantilla Maestra Institucional .docx)
                                         │
                                         ▼
                             [Word 16.0 COM Engine]
             (Recálculo de TOC, campos, geometrías y exportación PDF)
                                         │
                                         ▼
      [DOCX y PDF Oficiales v2.0 en docs/entrega_final/salida/]
```

---

## 2. Decisiones de Diseño Técnico

### D-01: Desacoplamiento de Diagramas de Casos de Uso
En lugar de un único gráfico con múltiples actores cruzando flechas, se diseñan 5 diagramas limpios:
* `02a-casos-uso-estudiante.mmd` (Actores: Estudiante)
* `02b-casos-uso-profesor.mmd` (Actores: Profesor)
* `02c-casos-uso-egresado.mmd` (Actores: Egresado)
* `02d-casos-uso-administracion.mmd` (Actores: Administrador y Moderador)
* `02e-casos-uso-empleador.mmd` (Actores: Empleador)
Cada uno utiliza conectores ortogonales, límites de sistema definidos y tipografía legible a tamaño de página A4 vertical.

### D-02: Solución DER en Doble Página (Facing Spread A4)
Para garantizar legibilidad total en las 30 entidades de la base de datos SQL Server:
* **Lámina Izquierda:**
  `USER`, `ACCOUNT`, `MAGIC_LINK`, `EMPLOYER_REQUEST`, `EMPLOYER_ONBOARDING_OUTBOX`, `INQUIRY`, `COMMENT`, `SOCIAL_ATTACHMENT`, `REACTION`, `COMMENT_REACTION`, `COMMUNITY_REPORT`, `USER_INTERACTION`, `MESSAGE`.
* **Lámina Derecha:**
  `CAREER`, `USER_CAREER`, `SUBJECT`, `SUBJECT_PREREQUISITE`, `ACADEMIC_RESOURCE`, `ACADEMIC_PROGRESS`, `JOB_OFFER`, `JOB_APPLICATION`, `USER_CV_EXPERIENCE`, `USER_CV_EDUCATION`, `USER_CV_PROJECT`, `USER_CV_SKILL`, `USER_CV_LANGUAGE`, `AUDIT_LOG`, `MODERATION_AUDIT`.
* Ambas láminas se renderizan a alta resolución (PNG scale 2 + SVG) y se colocan en páginas consecutivas con salto de sección y encabezados alineados.

### D-03: Diagrama de Clases UML del Dominio
Se diseña `07c-diagrama-clases-dominio.mmd` reflejando las clases principales del backend .NET 8 / EF Core:
* Atributos con tipo de dato exacto.
* Métodos principales de negocio.
* Composición con rombo relleno entre `Inquiry` y `Comment` y entre `Inquiry` y `SocialAttachment`.

### D-04: Portada y Membrete Institucional Oficial
Se estructura una portada formal en el documento maestro con:
* Logos oficiales de alta calidad extraídos de la carpeta TEAMS (`image7.jpg` Beltrán y `image2.jpeg` BA Educación) colocados en la cabecera.
* Datos completos de cátedra, alumno, ciclo lectivo 2026 y mesa evaluadora.

### D-05: Formato de Tablas con Recuadros y Espaciado
Pandoc y el motor de estilos de Word aplicarán la propiedad de bordes continuos (`w:top`, `w:left`, `w:bottom`, `w:right`, `w:insideH`, `w:insideV`) a todas las tablas del documento (RFs, RNF, BR y las 26 tablas CU), con márgenes internos de celda (padding de al menos 100 dxa / 5 pt) para evitar texto apretado.

---

## 3. Plan de Verificación y Compilación
1. Renderizado batch de los nuevos diagramas MMD a PNG y SVG.
2. Comprobación visual de legibilidad de cada diagrama al 100% de zoom.
3. Ejecución del script de preprocesamiento y ensamblado Pandoc.
4. Ejecución del script Word COM para actualizar TOC y generar PDF.
5. Validación visual de paginación e índices.
