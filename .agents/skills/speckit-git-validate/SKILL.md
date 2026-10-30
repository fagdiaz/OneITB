---
name: speckit-git-validate
description: Validate branch safety and active-spec context without changing Git state.
---

# Validate Branch and Feature Context

This skill is read-only.

1. Read the current branch and `git status --short`.
2. Reject direct feature integration on `main` or `master`.
3. Accept project branch forms such as `codex/<NNN>-<name>`, `<NNN>-<name>`, or an explicit
   reviewed team prefix. Do not require branch and spec directory to have the same number.
4. Read `.specify/feature.json` and verify its `feature_directory` resolves inside the
   repository and contains the artifacts required by the requested command.
5. Report branch, active feature, dirty path count, and mismatches. Make no checkout,
   switch, fetch, stage, commit, or push.
