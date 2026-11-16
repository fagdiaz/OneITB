# Quickstart: ATS-Friendly CV Export

## Automated

From `FrontEnd/OneItb-FE`:

```powershell
npm.cmd run test -- --run src/Components/resume/CVATSPrintTemplate.test.tsx
npm.cmd run test -- --run
npm.cmd run build
```

## Browser

1. Open a complete Student or Graduate profile.
2. Open `PDF optimizado para ATS` from `/profile` and `/profile/edit`.
3. Confirm identical section order and values in both previews.
4. Confirm no avatar, chips, columns or application chrome exist in the printable root.
5. Print to PDF with A4, default scale and backgrounds enabled.
6. Repeat with an approved complete profile whose content requires at least two pages;
   confirm no truncation. Do not add a production fixture route or modify a real profile
   solely for this check.

## PDF Artifact

With Poppler available:

```powershell
npm.cmd run analyze:ats -- .\artifacts\oneitb-cv-ats.pdf --expect "Perfil profesional" --expect "Experiencia"
```

The analyzer invokes bounded `pdftotext`, `pdfinfo` and `pdffonts` checks and reports
each criterion separately. It must not retain or print CV contents beyond the required
term/order assertions. Supply only non-sensitive expected terms; compare personal values
manually without copying them into tracked commands or evidence.

Record tool paths and output in `evidence/evidence.md`. Missing Poppler or a native print
dialog is a blocked gate, not a PASS.

## Cleanup

Delete only the temporary PDF fixture after evidence is recorded. Do not modify profile
data solely for this check unless a disposable account is approved.
