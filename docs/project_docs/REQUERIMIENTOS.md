# Especificación de Requerimientos y Alcance - OneITB23

Este documento consolida los requerimientos funcionales, no funcionales y la estructura de roles del sistema académico **OneITB23** (Red Social Educativa), basados en los relevamientos aprobados por la organización y el equipo.

---

## 1. Objetivos del Sistema
La plataforma está diseñada como una **Red Social Educativa y Académica** para el *Instituto Tecnológico Beltrán*. Busca centralizar la comunicación entre estudiantes, egresados y profesores, facilitar el acceso a recursos educativos compartidos y organizar el seguimiento de tutorías y consultas.

---

## 2. Requerimientos Funcionales (RF)

### 2.1. Gestión de Cuentas y Accesos
* **RF-001: Autenticación por Dominio Corporativo**: El sistema debe restringir el registro a correos electrónicos con el dominio oficial `@itbeltran.com.ar`.
* **RF-002: Control de Admisión**: Se implementa un filtro de seguridad y validación de estado activo en la cuenta antes de permitir el primer inicio de sesión.
* **RF-003: Registro y Autenticación**: Flujos de registro e inicio/cierre de sesión seguro con contraseñas encriptadas.

### 2.2. Perfiles de Usuario y Roles
* **RF-004: Perfiles Individuales**: Cada usuario cuenta con un perfil editable que incluye:
  - Datos personales (email, domicilio).
  - Redes de contacto externas (LinkedIn, Facebook, Instagram, etc.).
  - Biografía e intereses.
* **RF-005: Registro de Cursadas**: Posibilidad de registrar carreras y planes en curso (ej. Tecnicatura Superior en Análisis de Sistemas - TSAS, o Tecnicatura en Automatización y Control - TECAS).

### 2.3. Módulo Social y de Publicaciones
* **RF-006: Home y Cartelera**: Pantalla de inicio que muestra la cartelera de anuncios generales e institucionales.
* **RF-007: Perfil de Materia y Curso**: Cada materia/curso posee un espacio colaborativo exclusivo donde los docentes y alumnos asociados pueden:
  - Crear publicaciones (títulos, descripciones y archivos adjuntos).
  - Agregar comentarios en hilos de discusión.
  - Reaccionar a publicaciones.
* **RF-008: Mensajería Privada**: Sistema de mensajería/chat privado directo entre usuarios para coordinar proyectos y trabajos grupales.

### 2.4. Recursos y Seguimiento Académico
* **RF-009: Repositorio de Recursos**: Mapeo y descarga de archivos educativos (documentos, apuntes, presentaciones y libros electrónicos).
* **RF-010: Consulta e Integración SIU**: Interfaz para el seguimiento y trackeo de materias y notas (diseñada de forma modular para consumir futuras integraciones con la API del SIU Guaraní).

---

## 3. Requerimientos No Funcionales (RNF)

* **RNF-001: Seguridad (Crítico)**: Autenticación JWT con expiración, protección ReDoS en el procesamiento de expresiones regulares y almacenamiento cifrado de contraseñas mediante hash robusto.
* **RNF-002: Rendimiento**: Tiempos de carga y respuesta de endpoints optimizados para una navegación fluida.
* **RNF-003: Escalabilidad**: Capacidad para soportar un número incremental de usuarios concurrentes de la institución sin degradar el servicio.
* **RNF-004: Usabilidad y Adaptabilidad**: Interfaz web intuitiva responsiva que se adapta correctamente a dispositivos móviles, tablets y ordenadores de escritorio.
* **RNF-005: Mantenibilidad**: Arquitectura desacoplada backend/frontend y patrón transaccional Repository/Unit of Work que facilita futuras refactorizaciones.

---

## 4. Tipos de Usuarios e Identidades

* **Estudiante**: Puede interactuar en los perfiles de materias matriculadas, crear publicaciones, descargar apuntes, chatear y programar consultas.
* **Profesor**: Rol docente con permisos de administración sobre sus materias asociadas, capacidad para publicar anuncios oficiales, responder consultas y realizar el seguimiento académico.
* **Alumno Retirado / Egresado**: Acceso a la cartelera de egresados y redes profesionales externas.
* **Administrador**: Gestión global de cuentas, materias, asignación de roles y derecho de admisión.
