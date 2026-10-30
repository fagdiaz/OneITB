---
description: "Create a scoped Git commit only after an explicit user request"
---

# Scoped Commit

Automatic commits are disabled. Follow `.agents/skills/speckit-git-commit/SKILL.md` only after an explicit user request.

## Behavior

1. Inspect the complete worktree and staged diff.
2. Select only files belonging to the requested change.
3. Scan the selected files for secrets and generated trash.
4. Stage explicit paths and show the staged summary.
5. Commit only after the requested scope is clear. Never push implicitly.

## Execution

Do not invoke the compatibility auto-commit scripts; they are policy guards that perform no mutation.

## Configuration

`.specify/extensions/git/git-config.yml` must keep every automatic event disabled:

```yaml
auto_commit:
  default: false          # Global toggle — set true to enable for all commands
  after_specify:
    enabled: false
  after_plan:
    enabled: false
    message: "[Spec Kit] Add implementation plan"
```

## Graceful Degradation

- If Git is not available or the current directory is not a repository: skips with a warning
- If no config file exists: skips (disabled by default)
- If no changes match the requested scope: stop without creating a commit
