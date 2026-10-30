---
name: speckit-git-commit
description: Create an explicit, reviewed, feature-scoped Git commit when the user requests it.
---

# Reviewed Feature Commit

## Trigger

Run only when the user explicitly requests a commit. It MUST NOT run as a before/after
Spec Kit hook. A commit request does not authorize push.

## Procedure

1. Confirm the repository root and current branch.
2. Inspect `git status --short`, including unrelated user changes.
3. Review the intended diff and scan staged candidates for secrets, `.env`, credentials,
   runtime uploads, generated logs, local specs/tooling, and ignored artifacts.
4. Run the applicable tests/builds or state exactly which previously executed evidence is
   still valid for this unchanged diff.
5. Run `git diff --check` for the intended files.
6. Stage only explicit paths with `git add -- <paths>`. Never use `git add .`, `git add -A`,
   or broad wildcard staging in a dirty worktree.
7. Inspect `git diff --cached --stat` and `git diff --cached` before committing.
8. Commit once with a concise semantic message that matches the staged scope.
9. Report commit hash, message, included paths, validation, and remaining unstaged changes.

## Stop Conditions

- No explicit user request.
- A secret or personal credential may be staged.
- The staged diff includes unrelated work or generated artifacts.
- The current branch is `main`/`master` and repository policy forbids direct commits.
- Required validation for the requested scope failed.

Do not amend, rebase, reset, force, or push unless the user requests that separate action.
