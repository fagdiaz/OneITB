# Implementation Plan: Backend Inquiries and Subjects Endpoints

## Key Changes

1.  **Backend (`Query.cs`)**:
    -   Añadir `using HotChocolate.Data;` y `using OneItb.Data;`.
    -   Definir el resolver `GetSubjects` retornando `context.Subjects` con los atributos `[UseProjection]`.
    -   Definir el resolver `GetInquiries` retornando `context.Inquiries` con los atributos `[UseProjection]`.
2.  **Backend (`Mutation.cs`)**:
    -   Añadir `using OneItb.Data;` y `using OneItb.Entities.Models;`.
    -   Definir el resolver `AddInquiry` que acepte los argumentos escalares (`userId`, `subjectId`, `title`, `content`), instancie la entidad `Inquiry` y realice el `SaveChangesAsync()`.
