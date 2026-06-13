# Frontend Deep Audit Report - OneITB-FE

> Historical snapshot. For current stabilization status, use
> `docs/audit/fix-roadmap-13-06-2026.md`. The frontend currently builds with
> React 18, Apollo Client 3.7, Vite 8.0.16, and Tailwind CSS 4. The feed is not
> verified end-to-end because its publication query does not match the active
> GraphQL schema.

Este reporte consolidado detalla el estado actual del árbol de componentes, la estructura de enrutamiento y propone un estándar moderno de nomenclatura y arquitectura de archivos para el frontend de **OneITB23**.

---

## 1. Mapa de Componentes y Estado de Integración

Actualmente, el Módulo 1 (Autenticación) se encuentra 100% operativo a nivel de lógica, mientras que los layouts y vistas del muro social permanecen como maquetas estáticas:

| Componente | Archivo de Origen | Estado | Integración Funcional |
| :--- | :--- | :---: | :--- |
| **Login** | `src/Components/user/Login.jsx` | 🟢 100% | Conectado a mutación `AUTHENTICATE_USER`, guarda token JWT en storage local y actualiza el contexto de sesión. |
| **Register** | `src/Components/user/Register.jsx` | 🟢 100% | Conectado a mutación `ADD_USER`. Valida alias y restringe registro a dominio `@itbeltran.com.ar`. |
| **Logout** | `src/Components/user/Logout.jsx` | 🟢 100% | Conectado a `AuthContext`. Limpia storage local y redirige a `/login`. |
| **AuthContext** | `src/context/AuthContext.jsx` | 🟢 100% | Distribuye el estado de sesión `auth` y la validez del token en toda la app. |
| **Feed (Muro)** | `src/Components/publication/Feed.jsx` | 🔴 No verificado | Compila, pero la query de publicaciones no coincide con el esquema GraphQL activo. |
| **SideBar** | `src/Components/layout/private/SideBar.jsx` | 🟢 Completado/Refactorizado | Refactorizado y funcional con Tailwind. |
| **UserProfile** | `src/Components/profile/UserProfile.tsx` | 🟢 Completado/Refactorizado | Interfaz de perfil en el cliente frontend (completada mediante el trasplante del CV). |
| **Nav** | `src/Components/layout/private/Nav.jsx` | 🟡 Parcial | Estructura visual de pestañas pero con hipervínculos muertos (`href="#"`). |

---

## 2. Diagnóstico de Errores Visibles e Inactividad

* **Fallo de Visualización / Alineación del SideBar**:
  - **Estado**: 🟢 Resuelto. El CSS legacy fue purgado por completo y reemplazado por Tailwind CSS v4, eliminando los problemas de grillas CSS (`.layout`) y proporcionando una estructura de diseño robusta y responsiva.

* **Botones e Íconos Inactivos en Header y Nav**:
  - Todos los botones principales en `Nav.jsx` usan etiquetas `<a>` puras con `href="#"`. Esto rompe el comportamiento Single Page Application (SPA), provocando recargas vacías o nula respuesta. Deben ser reemplazados por componentes `<Link>` de `react-router-dom`.
  - La pestaña de perfil muestra el texto literal `"NickName"` hardcodeado en lugar de usar la propiedad dinâmica `{auth.username}` obtenida desde el contexto.

---

## 3. Propuesta de Arquitectura y Nomenclatura Moderna

Para asegurar que la base de código sea escalable ante la incorporación de nuevos módulos (Perfiles, Publicaciones y Consultas), se recomienda adoptar las siguientes directrices:

### A. Estructura de Directorios Basada en Features (Slices)
Migrar de la estructura plana actual a un diseño modular orientado a dominios de negocio:

```text
src/
├── components/         # Componentes comunes globales (UI / Layout compartidos)
│   ├── ui/             # Elementos mínimos: Button, Input, Spinner
│   └── layout/         # Estructuras: Header, Footer, SideBar
├── features/           # Módulos específicos de negocio
│   ├── auth/           # Login, Register, Logout
│   ├── publications/   # Feed, PostCard, PostForm
│   └── profile/        # UserProfile, UserStats
├── context/            # Proveedores de estado global (AuthContext)
├── hooks/              # Ganchos personalizados reutilizables (useForm)
└── services/           # Consultas y mutaciones GraphQL
```

### B. Reglas de Estilo de Código (Linting & Conventions)
* **React Components**: Todos los componentes visuales deben nombrarse estrictamente en **PascalCase** con extensión `.jsx` (ej. renombrar `feed.jsx` a `Feed.jsx`).
* **Directorio Raíz**: Cambiar la carpeta `/src/Components` a minúsculas (`/src/components`) para evitar inconvenientes de enrutamiento en sistemas que distingan mayúsculas.
* **Ganchos**: Nomenclatura camelCase obligatoria iniciando con `use` (ej. `useAuth.jsx`).
* **Estilos CSS**: Utilizar CSS Modules (`SideBar.module.css`) para encapsular las clases del componente y evitar sobreescritura de selectores globales.
