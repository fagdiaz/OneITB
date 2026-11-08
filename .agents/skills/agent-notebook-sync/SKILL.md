---
name: "agent-notebook-sync"
description: "Portable Development & Environment Synchronization Agent skill for OneITB23. Enforces resource-constrained execution (.wslconfig memory ceiling), clean Git state inspection between PC and Laptop, and offline verification without unauthorized pushes."
compatibility: "Used when executing on portable laptop environments."
metadata:
  author: "OneITB23 Architecture Team"
  source: "skills/agent-notebook-sync/SKILL.md"
---

# Agent Notebook & Portable Environment Sync Skill

Este skill define las pautas para trabajar en la computadora portátil (Notebook Dell / Laptop) asegurando una transición fluida, segura y sin fricción respecto a la estación de trabajo fija (PC).

## 1. Identidad y Misión

- **Rol:** Agente de Portabilidad y Continuidad de Entorno.
- **Mentalidad:** Cuidar los recursos físicos (batería, RAM en suspensión, consumo de disco) y evitar desincronizaciones o conflictos en Git.
- **Regla Invariante:** Prohibido ejecutar commits o pushes automáticos. Toda sincronización remota debe ser explícitamente autorizada por el usuario tras verificar el estado limpio del árbol de trabajo.

## 2. Protocolo de Inicio Rápido en Notebook

1. **Blindaje de Memoria de Docker/WSL2:**
   - Verificar la existencia de `C:\Users\<Usuario>\.wslconfig`.
   - Si no existe, crear el archivo con el techo de contención:
     ```ini
     [wsl2]
     memory=6GB
     processors=4
     swap=2GB
     autoMemoryReclaim=gradual
     sparseVhd=true
     ```
   - Esto evita que Docker congele la laptop cuando la memoria física esté en uso.
2. **Inspección Previa y Sincronización Segura:**
   - Al abrir la laptop, verificar primero el estado local antes de alterar ramas:
     ```bash
     git status
     git diff --stat
     ```
   - Si el árbol está limpio, sincronizar la rama objetivo consultando antes al usuario:
     ```bash
     git fetch origin
     git checkout <rama-autorizada>
     git pull origin <rama-autorizada>
     ```
3. **Verificación Pre-Flight Local:**
   - Asegurarse de que el contenedor Docker `oneitb23-sql` esté activo en el puerto `1433`.
   - Correr una prueba rápida de compilación y verificación:
     - Backend: `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`
     - Frontend: `cd FrontEnd/OneItb-FE; npm.cmd run test -- --run`
4. **Handoff de Regreso a la PC:**
   - Al terminar de trabajar en la laptop, verificar `git status` y `git diff --check`.
   - Presentar el resumen de cambios al usuario para que autorice formalmente el commit feature-scoped y el push.
   - Jamás realizar `git push` desatendido o sin aprobación explícita del usuario.
