# Feature Specification: Spec 219 - Normalización Editorial, Artefactos Visuales y Memoria Técnica v2.0 Oficial (2026)

## 1. Contexto y Objetivos

El proyecto OneITB23 se encuentra con su núcleo funcional 100% completo (117/117 ítems y 486 tests automatizados en verde). El hito actual es la finalización de la **Memoria Técnica Oficial para Imprenta** requerida para la defensa final ante la mesa evaluadora.

El documento histórico elaborado durante la cursada 2023 (`70. Práctica Profesional...`) define el marco, secciones requeridas, infografía, mockups y diagramas orientativos de la cátedra. Toda la presentación final debe ser **completamente nueva, modernizada, actualizada a la arquitectura real 2026 (.NET 8, React 18, Tailwind CSS v4, SQL Server 2022) y estéticamente profesional bajo normas APA 7 y estándares del Instituto Superior de Formación Técnica N° 197**.

---

## 2. Requerimientos Funcionales y Editoriales

### RF-01: Portada Institucional y Encabezados Modernizados 2026
* La portada debe integrar los logos institucionales oficiales en alta resolución (Marca Secundaria Beltrán y BA Educación) sin distorsión.
* Incorporar el membrete formal:
  * Unidad Integral de Educación Técnico Profesional de Avellaneda
  * Instituto Superior de Formación Técnica N° 197
  * Carrera: Tecnicatura Superior en Análisis de Sistemas
  * Espacio Curricular: Práctica Profesionalizante III
  * Proyecto: OneITB23 - Red Social Académica y Bolsa de Trabajo Institucional
  * Ciclo Lectivo: 2026
  * Alumno: Francisco Díaz
  * Mesa Evaluadora: Saldivar Sebastián Alfredo (Presidente) y Benítez Silvio Daniel (Vocal)
* Encabezados y pies de página deben contener numeración arábiga y títulos de sección uniformes.

### RF-02: Desacoplamiento de Diagramas de Casos de Uso (UML Profesional)
* Eliminar la sobrecarga visual de tener tres actores compitiendo en un solo gráfico.
* Generar diagramas independientes por actor con notación UML moderna (actores, límites de sistema, elipses de casos de uso y asociaciones ortogonales sin cruces):
  1. `02a-casos-uso-estudiante`: Interacción social, muro, recursos, materias, chat y postulaciones.
  2. `02b-casos-uso-profesor`: Publicación de recursos, muro académico, asignación de notas/progreso y consultas.
  3. `02c-casos-uso-egresado`: Muro institucional, perfil profesional/CV y búsqueda de empleo.
  4. `02d-casos-uso-administracion-moderacion`: Gestión de usuarios, carreras, materias, moderación y auditoría.
  5. `02e-casos-uso-empleador`: Publicación de ofertas laborales y gestión de candidatos.

### RF-03: Solución de Doble Página (Spread Facing A4) para el DER
* El Modelo de Dominio (30 entidades relacionales) debe ser 100% legible en el documento impreso.
* Se dividirá en una doble lámina panorámica continua diseñada para hojas enfrentadas (carpeta anillada abierta):
  * **Lámina Izquierda (Hoja Impar/Par izquierda):** Núcleo de Seguridad, Cuentas, Usuarios, Onboarding empresarial y Dominio Social (`USER`, `ACCOUNT`, `MAGIC_LINK`, `INQUIRY`, `COMMENT`, `SOCIAL_ATTACHMENT`, `REACTION`, `EMPLOYER_REQUEST`, etc.).
  * **Lámina Derecha (Hoja derecha):** Dominio Académico, Empleabilidad, CV relacional y Auditoría (`CAREER`, `SUBJECT`, `ACADEMIC_RESOURCE`, `JOB_OFFER`, `JOB_APPLICATION`, `USER_CV_*`, `AUDIT_LOG`, `MODERATION_AUDIT`).
* Los conectores inter-lámina deben coincidir exactamente a la misma altura en ambos bordes, con tipografía nítida mínima equivalente a 10pt real.

### RF-04: Diagrama de Clases UML del Dominio Real
* Generar el Diagrama de Clases UML moderno reflejando el modelo de dominio de Entity Framework Core 8.
* Incluir visibilidad (`+`, `-`, `#`), tipos de datos de atributos, métodos representativos y retorno.
* Aplicar las correcciones docentes históricas:
  * Composición estricta (rombo negro) entre Publicación y Comentarios.
  * Relación explícita con Materia (`Subject`).
  * Asociación de enumeraciones de roles mediante flechas de punta abierta.

### RF-05: Galería de Interfaces de Usuario (Mockups Modernos React 18 / Tailwind)
* Reemplazar los bocetos preliminares de 2023 por una galería moderna de pantallas del sistema real con diseño Clean Tech:
  1. Landing pública institucional y selector de acceso.
  2. Registro estudiantil con validación de carrera.
  3. Muro principal (`/feed`) con Media Grid y visor multimedia.
  4. Compositor de publicaciones con carga de adjuntos y portada.
  5. Perfil académico y CV estructurado (`/profile`).
  6. Módulo académico con recursos y materias (`/academic`).
  7. Mensajería privada en tiempo real (`/chat`).
  8. Bolsa de trabajo y detalle de vacante (`/empleos`).
  9. Gestor de postulaciones para empleadores (`/empleos/mis-ofertas`).
  10. Panel de administración y moderación de contenido (`/admin`).
* Cada interfaz debe presentarse como una figura numerada APA 7 con título y nota explicativa.

### RF-06: Tablas con Recuadros, Espaciado y Estilo APA 7
* Todas las tablas (Requerimientos Funcionales, Reglas de Negocio, RNF y las fichas de trazo fino CU-01 a CU-26) deben tener:
  * Bordes completos y delimitados.
  * Padding de celda que impida que el texto colapse contra las líneas.
  * Cabeceras con fondo sutil y texto en negrita.

### RF-07: Compilación Determinística del Entregable v2.0
* Generar los artefactos finales listos para imprenta en `docs/entrega_final/salida/`:
  * `OneITB23_Memoria_Tecnica_PP3_2026_v2_OFICIAL_IMPRENTA.docx`
  * `OneITB23_Memoria_Tecnica_PP3_2026_v2_OFICIAL_IMPRENTA.pdf`

---

## 3. Criterios de Aceptación
1. Cero diagramas ilegibles o con textos truncados al 100% de escala A4.
2. Casos de uso desagregados por actor, sin saturación de flechas.
3. El DER impreso debe leerse con total claridad al abrir las dos páginas enfrentadas.
4. Las 26 tablas de casos de uso y las tablas de requisitos deben contar con bordes limpios y espaciado consistente.
5. El PDF debe exportarse con índice dinámico actualizado y paginación continua.
