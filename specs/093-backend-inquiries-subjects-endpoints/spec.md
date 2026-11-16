# Feature Specification: Backend Inquiries and Subjects Endpoints

**Feature Branch**: `093-backend-inquiries-subjects-endpoints`

**Created**: 2026-06-13

**Status**: In Progress

## Requirements
- **FR-001**: Implementar los endpoints de lectura GraphQL `GetSubjects` y `GetInquiries` en `Query.cs`.
- **FR-002**: Implementar el endpoint de escritura GraphQL `AddInquiry` en `Mutation.cs` utilizando firmas escalares planas para el formulario de publicación del frontend.
- **FR-003**: Inyectar y utilizar el `OneItbContext` de forma nativa como `[Service]` en los métodos de HotChocolate.
