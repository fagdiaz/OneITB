# Spec: Excel Filters and Career Enrollment

## Objective
Refactorizar el buscador del Feed implementando filtros avanzados de selección múltiple (estilo Excel) para Carreras y Materias, y desarrollar la interfaz gráfica para que los usuarios puedan inscribirse a sus carreras desde la configuración de su perfil.

## Context
El Feed actualmente requiere un buscador minimalista pero poderoso. La barra superior solo debe tener: 1) Input de texto, 2) Selector múltiple desplegable (estilo Excel con checkboxes) y 3) Botón de búsqueda. Además, la base de datos ya soporta la relación UserCareer, pero el usuario carece de una interfaz para anotarse. Los administradores deben tener acceso a todas las carreras en el filtro, mientras que los usuarios normales solo verán las carreras a las que están inscritos.

## Requirements
1. **Interfaz de Enrolamiento**: Agregar sección "Mis Carreras" en la edición del perfil con checkboxes. Guardar usando la mutación `LinkUserToCareers`.
2. **Componente Multi-Select**: Crear `MultiSelectDropdown.jsx` usando Tailwind v4. Debe tener un botón de "Seleccionar Todos".
3. **Refactor Feed**: Limpiar la barra superior del Feed. Reemplazar los filtros antiguos por el nuevo MultiSelect.
4. **Lógica de Roles**: Administrador ve todas las carreras, el resto solo sus vinculadas. Materias dependen de las carreras seleccionadas.
