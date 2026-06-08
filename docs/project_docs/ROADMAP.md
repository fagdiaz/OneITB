# Roadmap del Proyecto y Estado de Objetivos - OneITB23

Este archivo define los módulos funcionales, objetivos de la plataforma y el estado de avance global del proyecto para la evaluación.

---

## 1. Estado Global de Avance: 42%

El porcentaje de avance se calcula basándose en el estado de los módulos obligatorios definidos para la entrega:

* 🟢 **Módulo 1: Autenticación y Cuentas**: 100% (Backend compilando y verificado).
* 🟡 **Módulo 2: Perfiles de Usuario**: 25% (Modelos físicos creados).
* 🟡 **Módulo 3: Publicaciones y Comentarios**: 50% (Materia y Consulta creados).
* 🔴 **Módulo 4: Mensajería Privada**: 0% (Pendiente de diseño).
* 🔴 **Módulo 5: Recursos y Seguimiento**: 0% (Pendiente de diseño).

---

## 2. Detalle de Módulos y Tareas

### Módulo 1: Autenticación y Cuentas (Estado: 🟢 Completado)
* [x] **T1.1**: Registro de usuarios con validación `@itbeltran.com.ar`.
* [x] **T1.2**: Hashing seguro mediante BCrypt char(60).
* [x] **T1.3**: Inicio de sesión (Login) con retorno de JWT expirable.
* [x] **T1.4**: Pipeline seguro (UseAuthentication antes de UseAuthorization).
* [x] **T1.5**: Redirección cliente-servidor e inyección dinámica del token en Apollo.

### Módulo 2: Perfiles de Usuario (Estado: 🟡 En Progreso)
* [x] **T2.1**: Mapeo físico de Entidad `User` y `Account` 1:1.
* [ ] **T2.2**: Carga de biografía y referencias a redes (LinkedIn, Facebook).
* [ ] **T2.3**: Registrar cursadas activas (TSAS / TECAS).
* [ ] **T2.4**: Interfaz de perfil en el cliente frontend.

### Módulo 3: Publicaciones y Comentarios (Estado: 🟡 En Progreso)
* [x] **T3.1**: Estructura de publicaciones vinculadas a `Subject` (Materias).
* [x] **T3.2**: Composición de comentarios (dependencia existencial en la base de datos).
* [ ] **T3.3**: Carga y descarga física de archivos educativos.
* [ ] **T3.4**: Reacciones a las publicaciones en el frontend.

### Módulo 4: Mensajería Privada (Estado: 🔴 Pendiente)
* [ ] **T4.1**: Servicio de mensajería y chat directo uno a uno.
* [ ] **T4.2**: Base de datos de mensajes privados.
* [ ] **T4.3**: Notificaciones en tiempo real para mensajes nuevos.

### Módulo 5: Recursos y Seguimiento (Estado: 🔴 Pendiente)
* [ ] **T5.1**: Tablero de visualización de notas.
* [ ] **T5.2**: Mock de consumo de la API de SIU Guaraní.
* [ ] **T5.3**: Habilitar/Deshabilitar notificaciones por materia.
