---
name: speckit-git-remote
description: Read and sanitize Git remote identity for an explicitly requested integration.
---

# Detect Git Remote Safely

1. Confirm the directory is a Git worktree.
2. Read remote names and URLs without modifying them.
3. Prefer the explicitly requested remote; otherwise inspect `origin`.
4. Parse HTTPS and SSH GitHub URLs only when the host is exactly `github.com`.
5. Redact userinfo, tokens, passwords, query strings, and fragments before displaying or
   storing a URL. Never echo an authenticated remote URL.
6. Return remote name, sanitized host, owner, repository, and whether it is GitHub.
7. If no matching remote exists, return an empty result; do not add or rewrite a remote.
