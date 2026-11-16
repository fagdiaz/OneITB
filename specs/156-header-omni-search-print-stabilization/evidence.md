# Evidence: Spec 156 Header Omni-Search & CV Print Stabilization

## Commands

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`
- `npm.cmd run build` from `FrontEnd/OneItb-FE`
- `npm.cmd run build` from `FrontEnd/OneItb-FE` second warm run

## Results

- Backend build: PASS, 0 warnings, 0 errors, 15.28s.
- Frontend build first run: PASS, 341 modules, 1.92s, 0 errors.
- Frontend build warm run: PASS, 341 modules, 862ms, 0 errors. This satisfies the requested sub-1000ms Vite build gate in this environment.
- Known warning remains: `vite:react-babel` reports deprecated `esbuild` option and recommends `oxc`. This warning predates Spec 156 and does not fail compilation.

## Notes

- No migration expected.
- Added a safe public GraphQL query for public profile search. It returns only `id`, `fullName`, `role`, `avatarUrl` and career names.
- Browser click-through and print-preview behavior should still be verified manually in the running app before demo.
