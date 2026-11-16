# Quickstart: validar adjuntos en publicaciones

1. Aplicar la migracion `AddFileUrlToInquiry`.
2. Iniciar backend y frontend.
3. Autenticarse y abrir el muro.
4. Crear una publicacion sin archivo y confirmar que permanece luego de recargar.
5. Crear otra con un PDF pequeno y confirmar el estado `Subiendo...`.
6. Abrir el enlace del adjunto desde la tarjeta.
7. Intentar cargar un archivo mayor a 15 MB y otro con extension no permitida.
8. Confirmar que una solicitud anonima a `/api/upload` recibe `401`.

## Validation commands

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
npm.cmd run build
```
