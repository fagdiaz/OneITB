---
name: speckit-git-initialize
description: Initialize Git only for an unversioned project and only on explicit request.
---

# Safe Git Initialization

1. Run only when the user explicitly asks to initialize Git.
2. If the directory is already inside a repository, report it and make no change.
3. Verify the resolved target is the intended project root.
4. Run `git init` only.
5. Do not stage or commit files. Initial staging/commit is a separate reviewed operation
   through `speckit-git-commit`.
6. Do not change global Git configuration, remotes, hooks, LFS, or default branch unless
   explicitly requested.

OneITB23 is already versioned, so this skill normally returns without action.
