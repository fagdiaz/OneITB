---
name: "speckit-qa"
description: "Purges technical debt, validates naming conventions, and ensures architectural integrity between frontend and backend before implementation."
compatibility: "Requires spec-kit project structure. Best results when provided with tasks.md and context of related schemas/DTOs. Runs before speckit-implement."
metadata:
  author: "github-spec-kit"
  source: "templates/commands/qa.md"
---

# Skill: speckit-qa

This skill acts as an architectural guard and technical debt filter. It reviews the generated `tasks.md` to optimize implementation steps, enforce strict naming conventions, prevent security flaws, and guarantee that refactors are robust and complete without adding unnecessary complexity.

## Core Instruction
Analizar el `tasks.md` generado. Tu objetivo es purgar la deuda técnica implícita en el plan y asegurar que `speckit-implement` reciba instrucciones perfectas. Debes interceptar malas prácticas de desarrollo, discrepancias de nomenclatura, problemas de consistencia global y faltas de seguridad, aplicando correcciones quirúrgicas (simples, directas y sin sobrecomplicar el alcance original de la tarea).

## QA Validation Rules

### 1. Naming Conventions & Language Consistency (Nomenclature)
* **Strict English Policy**: Todo el código, variables, base de datos, backend, GraphQL y estado del frontend deben estar estrictamente en **inglés**. El **español** se reserva única y exclusivamente para textos e interfaces visuales de la UI (labels, placeholders de cara al usuario, mensajes de error visibles).
* **GraphQL Schema (HotChocolate)**:
  * Field names must be `camelCase` and in English (e.g. `userId`, `firstName`, `lastName`, `alias`, `email`).
  * Type names must be `PascalCase` and in English (e.g. `RegisterInput`, `UserPayload`).
* **C# Domain Entities / DTOs**:
  * Properties must be `PascalCase` and in English (e.g. `UserId`, `FirstName`, `LastName`).
* **React Frontend / Form State**:
  * React local state properties must be `camelCase` and in English (e.g. `form.lastName`, `form.firstName`).
  * Variable names passed to Apollo Client mutation inputs must match the GraphQL schema fields in `camelCase` (e.g. `lastName: form.lastName`).

### 2. Technical Debt & Implementation Integrity (Anti-Flaws)
* **Variable Mapping & Compatibility**:
  * Check that all fields in the frontend query/mutation payload exist in the backend DTO inputs.
  * Check that any virtual/calculated properties (e.g. `fullName`, `password` placeholders) are properly mapped using `ObjectType<T>` descriptors in `Startup.cs` if the frontend requires them for backward compatibility.
  * Ensure no database entities are registered directly via `.RegisterService<T>()` in GraphQL middleware to avoid DI constructor issues.
* **Scope Completeness (Refactors globales)**: Si la tarea indica un cambio estético o funcional global, verifica que el plan liste *todos* los componentes afectados. Evita soluciones parciales que dejen la plataforma inconsistente o rompan estilos heredados.
* **No Hardcoding**: Asegura que configuraciones, URLs o flags no se inyecten directamente en el código; exige el uso de variables de entorno o archivos de configuración.
* **Component Isolation**: En el frontend, verifica que los cambios propuestos no generen acoplamiento innecesario o dupliquen lógica que ya exista en componentes compartidos (Shared/Common).

### 3. Security & Data Protection (AD-003)
* **Sensitive Data Handling**: Si la tarea implica persistencia o manejo de contraseñas, tokens o datos sensibles, el plan **debe incluir explícitamente su encriptación/hashing** (ej. BCrypt, Argon2) antes de guardarse en la base de datos. No permitas el almacenamiento en texto plano bajo ninguna circunstancia.
* **Exposure Prevention**: Verify that sensitive fields (such as `PasswordHash`, `Password`, `Salt`, `Secret`, or `Token`) are decorated with `[GraphQLIgnore]` or ignored via fluent descriptor configuration `.Ignore()` in `Startup.cs` to prevent credential exposure.

## Output Format
Si encuentras deuda técnica, errores de consistencia, discrepancias de idioma o vulnerabilidades en el archivo `tasks.md`, detén el flujo y estructura tu respuesta de la siguiente manera:

1. 🚨 **Deuda Técnica y Errores Detectados:** Una tabla comparativa que muestre: `Componente/Flujo | Tipo de Problema | Error Encontrado | Corrección Aplicada`.
2. ✅ **Tasks.md Optimizado:** El bloque de código completo, corregido y pulido, listo para que `speckit-implement` lo ejecute a la perfección.

Si el plan original es impecable y cumple con todas las reglas de QA de forma limpia, confírmalo sin alterar el archivo.