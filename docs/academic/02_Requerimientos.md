# 2. Especificación de Requerimientos de Software

## 2.1. Requerimientos Funcionales (RF)

### Gestión de Cuentas y Accesos
* **RF-001: Autenticación por Dominio Corporativo**: El sistema debe restringir el registro de estudiantes y docentes a correos electrónicos con el dominio oficial `@itbeltran.com.ar`. Se establece una **excepción** a esta regla de dominio para las cuentas con el rol "Empleador", quienes podrán registrarse utilizando correos corporativos externos sujetos a validación.
* **RF-002: Control de Admisión**: Se implementa un filtro de seguridad y validación de estado activo en la cuenta antes de permitir el primer inicio de sesión.
* **RF-003: Registro y Autenticación**: Flujos de registro e inicio/cierre de sesión seguros. Se incorpora soporte para autenticación tradicional (contraseñas encriptadas) y un flujo **"Passwordless"** (Magic Link al correo) complementado con verificación de identidad contra la **AFIP** (especialmente para la validación de empresas/empleadores).

### Perfiles de Usuario y Roles
* **RF-004: Perfiles Individuales**: Cada usuario cuenta con un perfil editable que incluye datos personales (email, domicilio), redes de contacto externas (LinkedIn, Facebook, Instagram) y biografía.
* **RF-005: Registro de Cursadas**: Posibilidad de registrar carreras y planes en curso (ej. Tecnicatura Superior en Análisis de Sistemas - TSAS, o Tecnicatura en Automatización y Control - TECAS).

### Módulo Social y de Publicaciones
* **RF-006: Home y Cartelera**: Pantalla de inicio que muestra la cartelera de anuncios generales e institucionales.
* **RF-007: Perfil de Materia y Curso**: Cada materia/curso posee un espacio colaborativo exclusivo donde los docentes y alumnos asociados pueden crear publicaciones (títulos, descripciones y archivos adjuntos), comentar en hilos y reaccionar.
* **RF-008: Grupos y Comunidades**: Capacidad para que los usuarios creen y se unan a grupos basados en intereses comunes o áreas temáticas.

### Mensajería Privada y Notificaciones
* **RF-009: Mensajería Privada**: Sistema de chat privado directo uno a uno entre usuarios para coordinar proyectos y trabajos grupales en tiempo real.
* **RF-010: Notificaciones Automáticas**: Notificaciones sobre nuevas publicaciones, comentarios, mensajes privados y actualizaciones de eventos con opción de activación/desactivación.

### Recursos y Seguimiento Académico
* **RF-011: Repositorio de Recursos**: Mapeo y descarga de archivos educativos (documentos, apuntes, presentaciones y libros electrónicos).
* **RF-012: Seguimiento Académico (Integración SIU)**: Interfaz para el seguimiento y trackeo de materias y notas consumiendo la API del SIU Guaraní de forma modular.

### Moderación Comunitaria
* **RF-013: Moderación y Reportes**: Sistema colaborativo que permite a la comunidad reportar contenido o comportamientos inapropiados en el Módulo Social. Las publicaciones que acumulen un umbral de advertencias (ej. 5 reportes) serán ocultadas automáticamente hasta su revisión final por el rol "Moderador", con el fin de proteger rápidamente el entorno y hacer cumplir el código de convivencia institucional.

---

## 2.2. Requerimientos No Funcionales (RNF)

* **RNF-001: Seguridad**: Autenticación JWT con expiración, protección ReDoS en expresiones regulares con timeout estricto de 250ms y almacenamiento cifrado de contraseñas mediante hashing robusto (BCrypt).
* **RNF-002: Escalabilidad**: Capacidad para soportar un número creciente de usuarios concurrentes de la institución sin degradar el rendimiento del servicio.
* **RNF-003: Rendimiento**: Tiempos de respuesta y carga de páginas optimizados para ofrecer una experiencia fluida.
* **RNF-004: Usabilidad y Adaptabilidad**: Interfaz web responsiva compatible con computadoras de escritorio, tablets y dispositivos móviles.
* **RNF-005: Disponibilidad**: Alta disponibilidad con un tiempo de inactividad mínimo para permitir el acceso permanente.
* **RNF-006: Mantenibilidad**: Arquitectura desacoplada backend/frontend y patrón transaccional Repository/Unit of Work que facilita futuras refactorizaciones.
* **RNF-007: Cumplimiento Normativo**: Cumplimiento de leyes de protección de datos personales, privacidad y derechos de autor.

---

## 2.3. Tipos de Usuarios y Roles

* **Estudiante**: Puede interactuar en los perfiles de materias matriculadas, crear publicaciones, descargar apuntes, chatear y programar consultas.
* **Profesor**: Rol docente con permisos de administración sobre sus materias asociadas, capacidad para publicar anuncios oficiales, responder consultas y realizar el seguimiento académico.
* **Alumno Retirado / Egresado**: Acceso a la cartelera de egresados y redes profesionales externas.
* **Moderador**: Miembros de la comunidad (ej. estudiantes avanzados, personal) con facultades para revisar reportes, ocultar publicaciones que infrinjan las normas y emitir advertencias, garantizando la sana convivencia.
* **Empleador**: Representantes de empresas y reclutadores externos validados por AFIP. Solo pueden publicar ofertas laborales en el muro público y visualizar los perfiles públicos de estudiantes y egresados para captación de talento, quedando estrictamente sin acceso a la cartelera interna ni a contenidos académicos exclusivos.
* **Administrador**: Gestión global de cuentas, materias, configuración del sistema, asignación de roles de alto nivel y derecho de admisión.
