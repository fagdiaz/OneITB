# Candidate Manifest

## Postponed-defense reconciliation - 2026-08-08

This section supersedes the current-state summary below for any future freeze decision;
the original 2026-08-05 inventory is retained as historical evidence. The academic
defense planned for 2026-08-07 at 09:00 did not occur because the final documentation,
code refinement/closure, and coordinated manual audit were not completed in time. No new
defense date is documented.

**Captured:** 2026-08-08  
**Branch:** `codex/199-ux-b2b-academic-onboarding`  
**HEAD:** `7a6036cbe6830dcb41590b46f88944fab3e76e60`  
**Tracking:** `origin/codex/199-ux-b2b-academic-onboarding`  
**Current candidate:** `UNFROZEN_WORKTREE`  
**Initial Git-visible paths before reconciliation edits:** 37 (10 modified, 27 untracked)  
**Git-visible paths after DOCX reconstruction:** 38 (12 modified, 26 untracked)

No functional code, test, migration, package, application/runtime configuration,
infrastructure, or runtime asset is modified in this snapshot. Git-visible changes are
documentary/editorial plus the reviewed path-specific repository-ignore rule.
The worktree is not eligible for T026 or CF-06.

### Modified tracked documentation

| Path | Category | Why it exists | Disposition | T022/T023 or gate impact |
|---|---|---|---|---|
| `.gitignore` | Repository hygiene | Adds the reviewed path-specific exclusion `/prompt_agy.txt` | Retain and version; no broad source/evidence pattern added | Removes one local prompt from Git-visible blockers; does not close the tree or a gate |
| `README.md` | Canonical entry point | Spec 218 metric synchronization | Retain and version after factual reconciliation | Release narrative only; tracked change invalidates a prior freeze binding |
| `docs/academic/01-project-overview.md` | Academic derivative | Current 234/252 preflight wording | Retain and version | Release narrative only |
| `docs/academic/04-design-diagrams.md` | Academic/technical derivative | EF/Compose corrections and A4 guidance for 13 diagrams | Retain and version after static/link review | Does not prove T023; affects final documentary gate |
| `docs/audit/DEVELOPMENT_LOG.md` | Historical audit log | Reverse-chronological records of the 05-06/08 documentary work | Retain and version; add only one 08/08 reconciliation entry | Does not prove manual QA |
| `docs/audit/DOCUMENTATION_STATUS.md` | Canonical document governance | Status and metric synchronization | Retain and version after recording the missed defense | Blocks documentary consistency until reconciled |
| `docs/audit/FINAL_AUDIT_REPORT.md` | Canonical risk/release recommendation | 46 V/71 I and 234/252 correction | Retain and version after recording the missed defense | CF-03 to CF-06 remain open |
| `docs/audit/RUNBOOK_DEV.md` | Canonical operational guide | Reconciliation notes that historical `predefense` script names apply to a future candidate | Retain and version | No runtime execution; procedure only |
| `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md` | Canonical academic memory | Metric, Magic Link, and delivery-source normalization | Retain and version; source for future DOCX/PDF | Does not prove print/visual portion of T023 |
| `docs/entrega_final/GUIA_MAQUETACION_FINAL.md` | Academic production guide | Updated baselines and diagram state | Retain and version after removing obsolete urgency/date language | Documentary gate remains open |
| `docs/project_docs/ROADMAP.md` | Canonical progress source | Spec 218 metric correction | Retain and version after recording 07/08 outcome and new sequence | CF-03/04/05/06 remain open |
| `docs/project_docs/scope-and-requirements.md` | Canonical product contract | Correct private-profile masking policy | Retain and version; evidence-backed Spec 201 correction | No direct T022/T023 completion |

### Untracked documentary and diagram sources

| Path | Category | Disposition | Versioning decision | Gate impact |
|---|---|---|---|---|
| `docs/entrega_final/DOCUMENTO_MAQUETACION.md` | Derived academic working source | Preserve; partial text-only maquetation source (925 lines, 48 RF, 0 embedded Mermaid) | Candidate for versioning only after reconciliation and editorial review | Does not close DF-05 or T023 |
| `docs/entrega_final/diagramas_fuente/EXPORT_CHECKLIST.md` | Editorial evidence/checklist | Preserve; only source extraction is checked, render/visual/DOCX/PDF rows remain open | Version with the diagram source package | Proves no visual acceptance |
| `docs/entrega_final/diagramas_fuente/FIGURE_MANIFEST.md` | Editorial manifest | Preserve; maps 10 memory figures plus 13 technical views | Version with the diagram source package | Supports classification, not rendering |
| `docs/entrega_final/diagramas_fuente/memoria/01-infografia-interaccion-alumno.mmd` | Memory figure source | Preserve | Version after Mermaid compile/visual review | DF-03 pending |
| `docs/entrega_final/diagramas_fuente/memoria/02-casos-uso-social-academico.mmd` | Memory figure source | Preserve | Version after Mermaid compile/visual review | DF-03 pending |
| `docs/entrega_final/diagramas_fuente/memoria/03-casos-uso-bolsa-trabajo.mmd` | Memory figure source | Preserve | Version after Mermaid compile/visual review | DF-03 pending |
| `docs/entrega_final/diagramas_fuente/memoria/04-casos-uso-administracion.mmd` | Memory figure source | Preserve | Version after Mermaid compile/visual review | DF-03 pending |
| `docs/entrega_final/diagramas_fuente/memoria/05-secuencia-registro.mmd` | Memory figure source | Preserve | Version after Mermaid compile/visual review | DF-03 pending |
| `docs/entrega_final/diagramas_fuente/memoria/06-secuencia-inicio-sesion.mmd` | Memory figure source | Preserve | Version after Mermaid compile/visual review | DF-03 pending |
| `docs/entrega_final/diagramas_fuente/memoria/07-modelo-dominio-der.mmd` | Memory figure source | Preserve; class/DER resolution still requires institutional-format decision | Version after model and visual review | DF-03/DF-04 pending |
| `docs/entrega_final/diagramas_fuente/memoria/08-arquitectura-componentes.mmd` | Memory figure source | Preserve | Version after Mermaid compile/visual review | DF-03 pending |
| `docs/entrega_final/diagramas_fuente/memoria/09-arquitectura-despliegue.mmd` | Memory figure source | Preserve | Version after Mermaid compile/visual review | DF-03 pending |
| `docs/entrega_final/diagramas_fuente/memoria/10-calendarizacion-gantt.mmd` | Memory figure source | Preserve | Version after Mermaid compile/visual review | DF-03 pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/01-contexto-sistema.mmd` | Technical figure source | Preserve | Version with technical source package | Visual QA pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/02-componentes-logicos.mmd` | Technical figure source | Preserve | Version with technical source package | Visual QA pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/03-der-identidad-perfil-catalogo.mmd` | Technical DER source | Preserve | Version after model/visual review | Visual QA pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/04-der-social-mensajeria-moderacion.mmd` | Technical DER source | Preserve | Version after model/visual review | Visual QA pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/05-der-academico-empleabilidad-auditoria.mmd` | Technical DER source | Preserve | Version after model/visual review | Visual QA pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/06-autenticacion-microsoft-entra.mmd` | Technical sequence source | Preserve | Version with technical source package | Visual QA pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/07-publicacion-multimedia.mmd` | Technical sequence source | Preserve | Version with technical source package | Visual QA pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/08-sincronizacion-siu-mock.mmd` | Technical sequence source | Preserve | Version with technical source package | Visual QA pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/09-onboarding-empresarial.mmd` | Technical sequence source | Preserve | Version with technical source package | B2B manual acceptance still pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/10-notificaciones-pubsub.mmd` | Technical realtime source | Preserve | Version with technical source package | Does not prove T022 |
| `docs/entrega_final/diagramas_fuente/tecnicos/11-despliegue-local-aceptacion.mmd` | Technical deployment source | Preserve | Version with technical source package | Visual QA pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/12-plantilla-productiva.mmd` | Technical target-deployment source | Preserve | Version with technical source package | External gates remain blocked/pending |
| `docs/entrega_final/diagramas_fuente/tecnicos/13-rebaseline-base-demo.mmd` | Technical operational source | Preserve | Version with technical source package | Historical/local evidence only |

### Ignored Word/PDF and Agy artifact classification

The Word/PDF files in this table are already excluded by the repository-wide
`*.docx`/`*.pdf` rules. They are preserved and were not edited, moved, or deleted during
classification. SHA-256 values were captured read-only on 2026-08-08. `AGENTS.md` and
the active spec/evidence are also intentionally ignored operational context; both were
reconciled locally and are not candidate content by current repository policy.

| Artifact | Structural/content classification | SHA-256 / disposition |
|---|---|---|
| `Prácticas Profesionalizantes III - Plantilla de documento base (1).docx` | Valid institutional source template; 3 recorded pages, placeholders remain | `a1770ce7...63761a`; preserve local, never treat as project content |
| `Programa 2026 - Prácticas Profesionalizantes III- TSA (1).pdf` | Institutional source PDF | `ea1a8592...06ea2`; preserve local |
| `OneITB23_Memoria_Tecnica_PP3_2026_v2.1_MASTER_PLANTILLA.docx` | Valid adapted template shell; 3 recorded pages and institutional placeholders | `c2e53b59...6a48f`; preserve as local template derivative |
| `OneITB23_Memoria_Tecnica_PP3_2026_v2.1_P03_PRESENTACION.docx` | Partial presentation-stage shell; 5 recorded pages, placeholders remain | `0cdb3ff0...bf2f1`; preserve, do not promote |
| `docs/entrega_final/salida/OneITB23_CATALOGO_26_CASOS_DE_USO.docx` | Valid editorial source: all CU-01 to CU-26, 28 tables; comments present | `889d1104...e377`; preserve as source, not final memory |
| `docs/entrega_final/salida/OneITB23_Memoria_BASE.docx` | Structurally valid intermediate; stale page metadata and incomplete assembly | `8b0ca8c4...6cff`; preserve, classify partial |
| `docs/entrega_final/salida/OneITB23_Memoria_CUERPO_CORREGIDO.docx` | Structurally valid intermediate; 35 recorded pages | `c8338379...3585`; preserve, classify partial |
| `docs/entrega_final/salida/OneITB23_Memoria_FORMATO_BASE.docx` | Structurally valid intermediate; stale page metadata | `e3ed0c44...e8c7e`; preserve, classify partial/duplicate candidate |
| `docs/entrega_final/salida/OneITB23_Memoria_MAQUETACION.docx` | Structurally valid early maquetation intermediate | `b513386c...27c`; preserve, classify partial |
| `docs/entrega_final/salida/OneITB23_Memoria_Tecnica_PP3_2026_v2.1.docx` | Structurally valid v2.1 intermediate | `7a3f91e5...8649`; preserve, classify partial |
| `docs/entrega_final/salida/OneITB23_Memoria_Tecnica_PP3_2026_v2.1_TRABAJO.docx` | Structurally valid 34-page working copy; Word lock file present | `9e38dff8...ad7a`; preserve, classify partial and in active/stale Word session |
| `docs/entrega_final/salida/OneITB23_Memoria_Tecnica_PP3_2026_v2.2_P04A_REQUISITOS_FUNCIONALES.docx` | Most developed artifact: valid OOXML, 76 recorded pages, 877 paragraphs, 43 tables, 321 rows, 2 images and all 26 use cases; mixed/incomplete content and no visual approval | `e02d463f...de3d`; preserve as primary recovery artifact, not canonical/final |
| `docs/entrega_final/salida/OneITB23_Memoria_Tecnica_PP3_2026_v2.3_CODEX_BORRADOR_TEXTO.docx` | Deterministic text reconstruction from canonical memory plus `03-use-cases.md`; valid OOXML, 1 A4 section, 782 body paragraphs, 38 tables, CU-01..CU-26 exactly once as headings, 13 ordered figure reservations plus an unnumbered class-diagram requirement, TOC/PAGE fields and zero accessibility findings | `b3ffe503...143f2`; preserve as ignored structural draft. It is not final, rendered, visually accepted, PDF-backed, or evidence for T023/CF-06 |
| Four `docs/entrega_final/salida/~$*.docx` files | Word owner/lock temporaries (162 bytes each) | Preserve while Word owns them; never version; remove only after Word closes and explicit cleanup review |

No `v2.3_AGY_CONSOLIDADO_TEXTO.docx`, `_PREVIEW.pdf`, `_AUDIT.md`,
`BACKUP_PRE_AGY.docx`, `_FAILED` candidate, `_agy_tmp/`, or `_agy_preview_pages/` exists.
The Agy run is therefore classified as **failed before deliverable materialization**.
The new v2.3 `CODEX_BORRADOR_TEXTO` is a separate reconstruction and does not retroactively
make the Agy run valid. `prompt_agy.txt` remains preserved locally and is now excluded by
the path-specific `.gitignore` rule `/prompt_agy.txt`.
LibreOffice/`soffice` is unavailable in the current environment, so no DOCX received a
visual render PASS; structural validity is not visual acceptance.

### Exact manual-task state

- **T022 is open / NOT RUN.** All eight rows in `manual-realtime-matrix.md` remain
  `NOT RUN`, both clients and the candidate SHA are pending, and no diagram or automated
  isolation test substitutes for two genuinely isolated browser sessions.
- **T023 is open / aggregate NOT RUN, with limited partial observations only.** The
  representative role matrix observed populated loading resolution and clean console
  states for several roles, but the required empty/error recovery, keyboard, responsive,
  both-theme, native print/PDF, and complete defense-critical journey matrix was not
  executed. Every cross-cutting journey remains `NOT RUN`. Existing Word/diagram files do
  not affect or complete T023.

### Current clean-tree and gate blockers

1. Review and integrate or explicitly exclude all 38 current Git-visible documentary
   paths (12 modified and 26 untracked).
2. Keep `prompt_agy.txt` local under the reviewed path-specific ignore rule.
3. Close Word and review the four lock files before any cleanup decision.
4. Insert and approve the figures in the structural v2.3 draft, update Word fields,
   render/inspect every page, and only then export and audit the PDF.
5. Complete T022 and T023, then update CF-04/CF-05 through T025.
6. Obtain a clean worktree and bind all mandatory automation/manual evidence to one SHA.
7. Only then may T026, the integral gate, T030, CF-06, and an optional tag be considered.

**CF-06 remains open. No SHA is frozen and no commit/tag is described as presented.**

**Captured:** 2026-08-05 04:09 -03:00  
**Branch:** `codex/199-ux-b2b-academic-onboarding`  
**Base HEAD:** `700c6c342d84b54e4687a306146ee09299fcc7fc`  
**Candidate:** `UNFROZEN_WORKTREE`

## Summary

| Category | Git paths | Disposition |
|---|---:|---|
| Configuration/root | 3 | Intended, pending integration |
| Backend | 25 | Intended, pending integration |
| Frontend | 46 | Intended, pending integration |
| Documentation | 14 | Intended canonical synchronization, including promotional infographic |
| **Total** | **88** | **All classified; pending integration** |

The Speckit directory and `.specify/feature.json` are intentionally ignored local workflow
artifacts and do not enter the professional candidate.

## Configuration and Root

| Path | Owner | Disposition |
|---|---|---|
| `.env.example` | Spec 215 storage/config contract | Retain; placeholders and numeric policy only |
| `docker-compose.prod.yml` | Spec 215 production storage fail-closed | Retain; Compose parse PASS |
| `.gitignore` | Spec 218 candidate hygiene | Retain; excludes the superseded local dark-logo draft |

## Backend

### Runtime contract, enrollment, and identity

The following paths belong to Specs 213-214 and are intended candidate content:

```text
API Graphql/Services/Academic/IStudentEnrollmentService.cs
API Graphql/Services/Academic/InstitutionalEnrollmentModels.cs
API Graphql/Services/Academic/ManualInstitutionalEnrollmentProvider.cs (deleted)
API Graphql/Services/Academic/SelfDeclaredInstitutionalEnrollmentProvider.cs (new)
API Graphql/Services/Academic/StudentEnrollmentService.cs
API Graphql/Services/Academic/UserCareerAssignmentService.cs (new)
API Graphql/Services/Users/UsersService.cs
API Graphql/Tests/Services.Tests/Academic/InstitutionalEnrollmentProviderTests.cs
API Graphql/Tests/Services.Tests/Academic/StudentEnrollmentServiceTests.cs
API Graphql/Tests/Services.Tests/Auth/UsersServiceTests.cs
```

**Disposition:** retain; backend 234/234 and Release build PASS.

### Storage and upload resilience

The following paths belong to Spec 215 and are intended candidate content:

```text
API Graphql/OneITB/Controllers/UploadController.cs
API Graphql/OneITB/Services/Storage/CloudinaryStorageService.cs
API Graphql/OneITB/Services/Storage/FileStorageOptions.cs (new)
API Graphql/OneITB/Services/Storage/FileStorageRegistration.cs
API Graphql/OneITB/Services/Storage/FileStorageUnavailableException.cs (new)
API Graphql/OneITB/Services/Storage/LocalFileStorageService.cs
API Graphql/OneITB/Startup.cs
API Graphql/OneITB/appsettings.Development.json
API Graphql/OneITB/appsettings.json
API Graphql/Tests/Services.Tests/Uploads/CloudinaryStorageServiceTests.cs (new)
API Graphql/Tests/Services.Tests/Uploads/FileStorageRegistrationTests.cs
API Graphql/Tests/Services.Tests/Uploads/LocalFileStorageServiceTests.cs (new)
API Graphql/Tests/Services.Tests/Uploads/UploadControllerTests.cs
```

**Disposition:** retain. Tracked appsettings contain no embedded SQL user/password;
provider URLs and demo secrets are empty/placeholders. Local `TrustServerCertificate=True`
is confined to Development as documented.

### Security and pagination regressions

```text
API Graphql/Tests/Services.Tests/GraphQL/MagicLinkContractTests.cs
API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs
```

**Disposition:** retain as regression coverage from the closing security and pagination
work; included in backend 234/234.

## Frontend

### Microsoft redirect and session boundary - Spec 213

```text
FrontEnd/OneItb-FE/src/Components/auth/MicrosoftRedirectBoundary.jsx (new)
FrontEnd/OneItb-FE/src/Components/auth/MicrosoftRedirectBoundary.test.jsx (new)
FrontEnd/OneItb-FE/src/Components/auth/MicrosoftRedirectCallback.jsx
FrontEnd/OneItb-FE/src/Components/auth/MicrosoftRedirectCallback.test.jsx
FrontEnd/OneItb-FE/src/auth/microsoftRedirectFlow.js
FrontEnd/OneItb-FE/src/auth/microsoftRedirectFlow.test.js
FrontEnd/OneItb-FE/src/context/AuthContext.jsx
FrontEnd/OneItb-FE/src/context/AuthContext.test.jsx
FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.test.js
FrontEnd/OneItb-FE/src/router/Routing.jsx
```

**Disposition:** retain; session and callback automated regressions are green.

### Authoritative academic enrollment and profile - Specs 208/214

```text
FrontEnd/OneItb-FE/src/Components/onboarding/AcademicOnboarding.jsx
FrontEnd/OneItb-FE/src/Components/onboarding/AcademicOnboarding.test.jsx
FrontEnd/OneItb-FE/src/Components/onboarding/RequireAcademicOnboarding.jsx
FrontEnd/OneItb-FE/src/Components/onboarding/RequireAcademicOnboarding.test.jsx
FrontEnd/OneItb-FE/src/Components/onboarding/academicEnrollmentCache.js (new)
FrontEnd/OneItb-FE/src/Components/onboarding/academicEnrollmentCache.test.js (new)
FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.lifecycle.test.tsx
FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.test.tsx
FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx
FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx
FrontEnd/OneItb-FE/src/Components/profile/profileCareerSelection.ts
```

**Disposition:** retain; CV/profile and enrollment tests were included in the historical
251/251 pre-hotfix run. The current Spec 218 frontend baseline is 252/252.

### Feed pagination and administration - Spec 216

```text
FrontEnd/OneItb-FE/src/Components/admin/CommentManagement.jsx
FrontEnd/OneItb-FE/src/Components/admin/PublicationManagement.jsx
FrontEnd/OneItb-FE/src/Components/admin/PublicationManagement.test.jsx
FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx
FrontEnd/OneItb-FE/src/Components/publication/FeedPaginationControls.jsx (new)
FrontEnd/OneItb-FE/src/Components/publication/FeedPaginationControls.test.jsx (new)
FrontEnd/OneItb-FE/src/hooks/useInquiryPage.js
FrontEnd/OneItb-FE/src/hooks/useInquiryPage.test.js
```

**Disposition:** retain; automated cursor, concurrency, stale-filter and terminal-state
coverage is green. Dataset >15 browser acceptance remains pending.

### Storage client - Spec 215

```text
FrontEnd/OneItb-FE/src/utils/uploadFile.js
FrontEnd/OneItb-FE/src/utils/uploadFile.test.js
```

**Disposition:** retain; previous avatar preservation and sanitized 503 behavior covered.

### Brand, landing, theme, and navigation - Specs 212/217

```text
FrontEnd/OneItb-FE/src/Components/branding/BrandLockup.jsx
FrontEnd/OneItb-FE/src/Components/branding/BrandLockup.test.jsx
FrontEnd/OneItb-FE/src/Components/branding/BrandLogo.jsx
FrontEnd/OneItb-FE/src/Components/branding/BrandLogo.test.jsx
FrontEnd/OneItb-FE/src/Components/institutional/ExternalInstitutionalLink.jsx (new)
FrontEnd/OneItb-FE/src/Components/institutional/institutionalLinks.js (new)
FrontEnd/OneItb-FE/src/Components/layout/Footer.jsx
FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx
FrontEnd/OneItb-FE/src/Components/layout/private/Header.test.jsx
FrontEnd/OneItb-FE/src/Components/user/Landing.jsx
FrontEnd/OneItb-FE/src/Components/user/Landing.test.jsx
FrontEnd/OneItb-FE/src/context/ThemeContext.jsx
FrontEnd/OneItb-FE/src/context/ThemeContext.test.jsx
FrontEnd/OneItb-FE/src/index.css
FrontEnd/OneItb-FE/src/visualAssets.test.js
FrontEnd/OneItb-FE/src/assets/logo-oneitb-dark-mode.png (new, referenced)
```

**Disposition:** retain. Build output proves the approved dark logo is bundled.

### Resolved image disposition

| Path | Reference scan | Disposition |
|---|---|---|
| `docs/entrega_final/assets/oneitb-infografia.png` | Not a runtime dependency | Retain as an optional promotional presentation/anex asset; excluded from SPA bundle |
| `FrontEnd/OneItb-FE/src/assets/logo-oneitb-dark-mode-old.png` | No source reference | Preserve locally and ignore explicitly as a superseded visual draft |

Neither file is required by the successful Vite build. The approved runtime asset remains
`logo-oneitb-dark-mode.png`; the old comparison file is preserved without entering Git.

## Canonical Documentation

All paths below are intended synchronization from Specs 212-217 and this gate:

```text
README.md
docs/academic/01-project-overview.md
docs/academic/02-software-requirements.md
docs/academic/04-design-diagrams.md
docs/audit/DEVELOPMENT_LOG.md
docs/audit/DOCUMENTATION_STATUS.md
docs/audit/FINAL_AUDIT_REPORT.md
docs/audit/RUNBOOK_DEV.md
docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md
docs/entrega_final/GUIA_MAQUETACION_FINAL.md
docs/project_docs/ROADMAP.md
docs/project_docs/architecture-and-design.md
docs/project_docs/scope-and-requirements.md
```

**Disposition:** retain, then run link/metric/terminology review before freeze.

## Hygiene Conclusion

- High-confidence private-key/token pattern scan: PASS, no matches.
- Sensitive tracked filename review: only approved examples and `.gitkeep` files.
- Runtime uploads, `.env`, build outputs, logs, local secrets, specs, and temporary audit
  notes are ignored by explicit rules.
- All current Git paths have a disposition. Candidate freeze remains blocked by the dirty
  worktree until explicit Git integration occurs.
