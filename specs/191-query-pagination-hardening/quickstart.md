# Quickstart: Spec 191 Implementation and Validation

## Inventory

~~~powershell
rg -n "GetInquiries|GetInquiriesPage|GetAcademicStudents|\\.Any\\(" "API Graphql/Services" "API Graphql/OneITB/GraphQL"
rg -n "GET_INQUIRIES|GET_ACADEMIC_STUDENTS" "FrontEnd/OneItb-FE/src"
~~~

## Automated Gates

~~~powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
npm.cmd run test -- --run
npm.cmd run build
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
~~~

Run frontend commands from `FrontEnd/OneItb-FE`.

## Runtime Matrix

1. Load first/next/final feed pages as student and admin.
2. Search and open an exact inquiry deep link.
3. Open profile/admin publication and comment views and verify bounded navigation.
4. Load academic students as professor/admin through multiple pages.
5. Cancel an in-flight request and verify no follow-up EF/log failure.
6. Inspect GraphQL schema to confirm the legacy unbounded field disposition.

The runtime matrix is intentionally separate from static/build gates. Do not mark the spec `[V]` until these authenticated checks are executed against the canonical Docker SQL runtime.
