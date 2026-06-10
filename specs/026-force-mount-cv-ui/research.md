# Research Notes: Force Mount CV UI (026)

## Import Mapping
- `ResumePreview` is exported as a named export from `../resume/ResumePreview.tsx`.
- `PersonalForm` is exported as a named export from `../editor/PersonalForm.tsx`.

## Mock Data Boundaries
To render `<ResumePreview />` without warnings, the data structure needs a compliant `CVData` object structure containing `personalInfo`, `summary`, `experience`, `education`, `projects`, `skills`, and `languages` properties.
