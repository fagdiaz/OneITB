# Implementation Plan: HotChocolate Projections Fix

## Key Changes

1.  **Backend (`Startup.cs`)**:
    -   Inspeccionar el método `ConfigureServices`.
    -   Ubicar la cadena `services.AddGraphQLServer()`.
    -   Añadir `.AddProjections().AddFiltering().AddSorting()` a la cadena del builder.
