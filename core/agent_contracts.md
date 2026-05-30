# Agent Contracts & Tooling Specifications: OneITB23

**Target Assistants**: AI Coding Agents / Spec Kit Engine
**Current Spec Kit Version**: 0.8.15

## 1. Specification Protocols
AI Agents working in this repository must strictly adhere to the Spec Kit command sequence:
1. **`/speckit-specify`**: Drafts and refines functional user specifications.
2. **`/speckit-plan`**: Maps out technical design, data structures, and conducts constitution compliance check.
3. **`/speckit-tasks`**: Generates a dependency-ordered, parallel-friendly checkbox task list.
4. **`/speckit-implement`**: Iteratively implements and marks off tasks in `tasks.md`.

## 2. Directory Governance
- **`/core/`**: Read/write access exclusively for AI Agent execution context and specify metadata.
- **`/core-web/`**: Read/write access for human Project Managers and Gemini Web reasoning context.
- **`/.specify/`**: Houses integrations, configurations, and core template directories.

## 3. Template Execution Guidelines
All specification templates (`spec-template.md`, `plan-template.md`, `tasks-template.md`) must remain strictly neutral and tool-agnostic. No platform-specific naming (e.g. "CLAUDE") is permitted.
