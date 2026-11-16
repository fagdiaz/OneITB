# Quickstart: Spec 162 Validation

1. Build frontend:

   ```powershell
   cd FrontEnd/OneItb-FE
   npm.cmd run build
   ```

2. Static checks:

   ```powershell
   rg -n "localStorage\\.clear|setAuth\\(" FrontEnd/OneItb-FE/src
   rg -n "useQuery\\(GET_USER_PROFILE" FrontEnd/OneItb-FE/src
   ```

3. Browser QA when local app is available:

   - Login as user A.
   - Confirm Header, SideBar, search filters and profile edit show user A.
   - Logout using Header menu.
   - Login as user B without refreshing.
   - Confirm no user A name, avatar, careers, notifications or profile edit data appears.
