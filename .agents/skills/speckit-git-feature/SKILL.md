---
name: speckit-git-feature
description: Create or switch to a reviewed feature branch without commits or network side effects.
---

# Feature Branch

## Trigger

Run only when branch creation/switching is explicitly requested. Spec creation does not
implicitly authorize a Git mutation; `.specify/extensions.yml` keeps this hook disabled.

## Rules

1. Inspect current branch and `git status --short`; preserve all user changes.
2. Default Codex branches to `codex/<NNN>-<short-name>`. Accept an explicit valid branch
   name from the user. Never use spaces, `..`, control characters, or unsafe ref syntax.
3. Spec directory numbering and branch naming are independent. The active spec remains
   selected by `.specify/feature.json`.
4. Create with `git switch -c <branch>` or switch to an existing branch only after
   verifying the target. Do not fetch, prune, pull, merge, rebase, or contact remotes.
5. Do not stage, commit, reset, restore, or push as part of branch creation.
6. Report the resulting branch and whether the worktree already contained changes.

Stop if switching would overwrite files or if the requested name is `main`/`master` for
feature work.
