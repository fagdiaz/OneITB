$ErrorActionPreference = "Stop"

$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ASPNETCORE_URLS = "http://localhost:5000"

Set-Location "F:\React\OneITB23\API Graphql\OneITB"
dotnet "bin\Debug\net8.0\GraphQL.dll" *> "F:\React\OneITB23\specs\136-academic-module\backend-dll-runtime.log"
