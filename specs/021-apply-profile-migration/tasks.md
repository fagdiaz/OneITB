# Tasks: Apply Profile Migration (021)

**Input**: Design documents from `/specs/021-apply-profile-migration/`

## Phase 1: Implementation
- [x] T001 Execute `dotnet ef migrations add AddUserBioAndSocials --project ../Data --startup-project .`
- [x] T002 Execute `dotnet ef database update --project ../Data --startup-project .`
