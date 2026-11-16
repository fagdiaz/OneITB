# Data Model: Presentation Runtime Baseline

No persistent domain model changes are planned.

## Console Finding

- `message`: normalized console entry text
- `source`: reported file, URL, or browser subsystem
- `severity`: error, warning, info, or recommendation
- `ownership`: application frontend, backend/API, browser, extension, or third-party embed
- `flow`: login, feed, media embed, link preview, upload, chat, startup, or unknown
- `action`: fix, document external, verify resolved, or blocked
- `evidence`: command output, browser capture, or file reference proving classification

## Runtime Check

- `name`: check being executed
- `environment`: terminal/browser/profile details relevant to reproducibility
- `result`: pass, fail, blocked, or external
- `evidence`: captured command/browser result
- `nextAction`: required remediation when not passing

## Presentation Gate

- `item`: presentation-critical flow
- `requiredEvidence`: what must be proven
- `status`: verified, blocked, or unverified
- `owner`: app, environment, or external provider
