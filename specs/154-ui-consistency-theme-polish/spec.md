# Spec 154: UI Consistency & Theme Polish

## Objective

Corregir inconsistencias visuales detectadas tras Spec 153:

- Restaurar el Header con identidad brand oscura tambien en Clean Tech.
- Replicar el glow/focus del boton de notificaciones en todos los controles del Header.
- Compactar el widget flotante de chat con escala tipo Facebook desktop.
- Oscurecer superficies residuales claras en comentarios, modulo academico y panel admin.
- Limpiar la plantilla impresa del CV para eliminar marcas institucionales no deseadas.

## Scope

- Frontend React/Tailwind v4 only.
- Componentes reales routeados: Header/Nav/GlobalSearch/NotificationBell, MiniChatWidget, CommentThread, AcademicDashboard, AdminDashboard y componentes admin, CVPrintTemplate.
- No se modifican contratos GraphQL, backend ni base de datos.

## Acceptance Criteria

- Header mantiene fondo brand oscuro en modo claro y modo oscuro.
- Controles del Header comparten hover/focus glow coherente.
- Mini chat widget queda visiblemente mas compacto en escritorio.
- Comentarios, academico y admin no muestran tarjetas blancas quemadas en Tech Noir.
- La impresion de `/profile` no incluye "Curriculum institucional" ni fallback "Perfil academico".
- `npm.cmd run build` finaliza con 0 errores.
