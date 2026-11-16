# Plan de Implementación: Spec 226

## Lotes de Ejecución:
- **Lote A — Catalogar sin mover:** Extender `DOCUMENTATION_STATUS.md` existente con clase, autoridad, estado, origen/derivado y política Git. Clasificar locales/entregables y relevar los 44 URIs `file:///` dependientes de máquina sin mover archivos.
- **Lote B — Publicación explícita:** Ajustar `.gitignore` de forma selectiva para excluir `scratch/` de raíz, perfiles y temporales, preservando plantillas y tooling necesario para un clon limpio. Verificar coherencia con `git check-ignore`.
- **Lote C — Navegación e índices:** Establecer alias e índices documentales portables desde `README.md` hacia la documentación canónica, asegurando que un clon contenga todo lo necesario para reproducir controles.
