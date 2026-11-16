# Feature Specification: Frontend Deep Audit (018)

**Feature Branch**: `018-frontend-deep-audit`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Realizar un relevamiento exhaustivo (Deep Audit) del código fuente del Frontend (React/Vite). Identificar el estado actual del árbol de componentes, rutas, código huérfano (zombie code), componentes desconectados y analizar la nomenclatura de UI para proponer un estándar moderno."

## Deep Audit Details

### Active Components & Status
- **Login.jsx**: 🟢 Complete, GraphQL integrated.
- **Register.jsx**: 🟢 Complete, GraphQL integrated.
- **Logout.jsx**: 🟢 Complete, AuthContext integrated.
- **feed.jsx**: 🟡 Mock UI. Needs GraphQL query integration.
- **SideBar.jsx**: 🟡 Mock forms. Profile dynamically loaded.
- **Nav.jsx**: 🟡 Unconnected router elements.

### Zombie Code & Redundancy
- **SideBar.jsx**: Unused import of local user image asset (`import avatar`).
- **GraphqlProvider.js & GeneralDataProvider.js**: Overlapping logic writing tokens into localStorage.

### Naming & Standards Proposal
- Standardize all visual React component files to CamelCase (e.g. `feed.jsx` -> `Feed.jsx`).
- Standardize all layout and service folders to lowercase (e.g. `Components` -> `components`).

## Success Criteria
- **SC-001**: Clean build validation with no active errors.
- **SC-002**: Detailed mapping of visual layouts and state bindings in development documentation.
