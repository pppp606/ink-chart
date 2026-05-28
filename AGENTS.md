# AGENTS.md — repository development guide for AI agents

This file is for AI agents working on this repository itself (not for runtime consumers of the package).

## Scope

- Follow existing TypeScript + Ink code style and keep changes minimal/surgical.
- Prefer docs + tests updates when behavior changes.
- Do not introduce BI-style complexity into component defaults.

## Development priorities

1. Preserve terminal readability and narrow-width behavior.
2. Keep rendering stable (avoid noisy redraw patterns).
3. Keep color optional/assistive; never required for meaning.
4. Keep Unicode behavior conservative and cross-terminal-safe.

## Operational rules for repo work

- When changing chart behavior, update README examples/props docs.
- Keep component APIs simple; avoid adding dense configuration surfaces by default.
- Add/adjust tests for layout, width handling, and edge cases when logic changes.
- Prefer backward-compatible changes unless explicitly requested.

## Validation checklist before finishing

- [ ] Typecheck passes (or failure clearly explained)
- [ ] Relevant tests run (or skipped with reason)
- [ ] README/API docs updated if public behavior changed
- [ ] No new color-only semantics
- [ ] Narrow terminal behavior considered (~80 cols)
