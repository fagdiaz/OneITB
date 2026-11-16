# Quickstart: Profile as a CV

1. Start the frontend against a working backend session.
2. Log in with any active user.
3. Open `/profile`.
4. Verify:
   - CV-style hero renders.
   - "Editar CV/Perfil" is visible.
   - Careers and owner academic summary render when data exists.
5. Open `/profile/{otherUserId}`.
6. Verify:
   - CV-style hero renders.
   - "Editar CV/Perfil" is not visible.
   - No private progress/grades are displayed.
7. Run:

```powershell
npm.cmd run build
```
