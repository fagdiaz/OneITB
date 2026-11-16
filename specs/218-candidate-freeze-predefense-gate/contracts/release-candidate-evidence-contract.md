# Release Candidate Evidence Contract

## 1. Candidate identity

Each final evidence record MUST contain:

- UTC and local timestamp;
- branch and full commit SHA;
- `git status --short` result;
- environment classification (`Development`, local acceptance, academic defense);
- tool versions relevant to the command;
- exact command or manual procedure identifier;
- exit/result status (`PASS`, `FAIL`, `BLOCKED`);
- result counts and key assertions;
- cleanup result;
- deviations and residual risks.

Worktree-only preflight records MUST use `candidate: UNFROZEN_WORKTREE` and cannot close
CF-06.

## 2. Status semantics

| Status | Meaning |
|---|---|
| PASS | The complete documented check ran successfully on the stated candidate |
| FAIL | The check ran and an owned assertion failed |
| BLOCKED | The check could not run because a named dependency was unavailable |
| NOT RUN | No attempt was made; a reason and owner are required |

Timeout, suppressed output, partial execution, historical evidence, or successful
compilation alone cannot be converted to PASS.

## 3. Freeze predicate

The candidate MAY be frozen only when all are true:

1. intended content is integrated and the worktree is clean;
2. no candidate secret/residue blocker remains;
3. backend tests >=234 and frontend tests >=252 pass on the same SHA;
4. backend and frontend production builds pass on the same SHA;
5. EF reports zero pending model changes;
6. local infrastructure and demo database gates pass or have an explicitly accepted,
   non-mandatory classification;
7. six-role and two-session manual matrices pass;
8. cleanup is complete;
9. canonical documents describe remaining external-production gates honestly;
10. the user explicitly authorizes the Git freeze operation.

## 4. Invalidating events

Any source, migration, package, configuration contract, validation script, or tracked
documentation change after a gate invalidates the affected evidence. A functional change
invalidates full automated and manual evidence unless a narrower impact is rigorously
justified in the candidate record.

## 5. Redaction

Evidence MUST NOT contain passwords, JWTs, refresh tokens, provider credentials, connection
strings, private certificates, `.env` contents, or user-secret values. Test identities may
be named by email only when they are canonical non-sensitive demo accounts.
