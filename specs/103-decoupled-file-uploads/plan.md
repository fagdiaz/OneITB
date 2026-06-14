# Implementation Plan: Decoupled File Uploads

**Branch**: `[103-decoupled-file-uploads]` | **Date**: 2026-06-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/103-decoupled-file-uploads/spec.md`

## Summary

Build a hybrid file upload system: A .NET 8 Web API controller for handling `multipart/form-data` uploads to the physical filesystem (`wwwroot/uploads`) and providing a streaming endpoint for previews. Extend the `Inquiry` entity and GraphQL `AddInquiry` mutation to accept and persist the generated relative file path. Finally, update the React frontend to include a file input in the creation feed.

## Technical Context

**Language/Version**: C# (.NET 8), JavaScript (React 18)

**Primary Dependencies**: ASP.NET Core MVC, HotChocolate (GraphQL), Apollo Client

**Storage**: Local Filesystem (`wwwroot/uploads`), SQL Server (Entity Framework Core)

**Testing**: Local manual QA

**Target Platform**: Web browser, Server backend

**Project Type**: Web Application

**Constraints**: Hybrid architecture (REST for files, GraphQL for data), Streaming compliance for previews

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
Passes all gates. Uses ASP.NET Core's built-in `IFormFile` and `PhysicalFile` results, keeping binary data out of the GraphQL graph as mandated by the architecture.

## Project Structure

### Documentation (this feature)

```text
specs/103-decoupled-file-uploads/
├── plan.md              # This file
└── spec.md              # Feature specification
```

### Source Code

```text
API Graphql/
├── OneITB/
│   ├── Startup.cs                  # To enable app.UseStaticFiles()
│   ├── Controllers/
│   │   └── FilesController.cs      # New REST controller for uploads/streaming
│   └── GraphQL/
│       ├── Mutation.cs             # Update AddInquiry mutation
│       └── Inputs/InquiryInput.cs  # Update input type to accept file url
├── Entities/
│   └── Models/
│       └── Inquiry.cs              # Add AttachedFileUrl property

FrontEnd/OneItb-FE/src/
├── data/graphql/mutations/
│   └── inquiries.js                # Update CREATE_INQUIRY mutation string
└── Components/publication/
    └── Feed.jsx                    # Add file input and handle POST fetch to REST API
```

**Structure Decision**: Will adhere to the existing separations (REST Controllers parallel to GraphQL config) and Apollo abstractions in the frontend.

## Complexity Tracking

None. No violations.
