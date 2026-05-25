# AGENTS.md — concise operational guide for AI agents using ink-chart

This file defines practical rules for AI agents that use or generate code with **@pppp606/ink-chart**.

## 1) Mission and scope

`ink-chart` is for **terminal-native status visualization** in CLI tools.

Priorities (in order):
1. **Readability over precision**
2. **Narrow-terminal first** (target ~80 cols)
3. **Low cognitive load**

Use this library when you need trend/state awareness in terminal workflows (long-running CLI, developer tooling, SSH/CI summaries). Avoid using it as a BI dashboard replacement.


## 2) Core rules (always apply)

- Charts are **ambient indicators**, not primary analytical surfaces.
- Do not output charts without text context.
- Color must be assistive, never the only signal.
- Keep layouts stable across updates (avoid jitter/flicker/reordering).
- Prefer simple, sparse output over dense dashboards.

Recommended text+chart template:
1. One-line state summary
2. One-line change/anomaly note
3. One short chart
4. One-line next action


## 3) Component selection (compressed)

### Sparkline
Use for compact inline trend signals. Avoid for axis-heavy or precision reading.

Defaults:
- Short caption (optional)
- Threshold only for clear boundary signaling
- Avoid defaulting to `width="full"`

### BarChart
Use for category comparison (Top-N, status/error breakdown).

Defaults:
- Keep rows limited (roughly <=8–10)
- Prefer `showValue="right"`
- Use `sort="desc"` when priority ranking helps
- Keep labels short and truncation-friendly

### StackedBarChart
Use for composition ratio (single entity split), not dense comparison.

Defaults:
- Keep segments low (roughly 3–5)
- Show labels/values so meaning survives without color
- Prefer `mode="percentage"`; use absolute mode as supplemental

### LineGraph
Use for temporal trend detail beyond sparkline.

Defaults:
- Keep series minimal (ideally 1–2)
- Keep height moderate (~4–8 rows)
- Keep axis labels sparse


## 4) Terminal constraints (width/SSH/CI/Unicode)

- Verify output around ~80 columns before proposing wider layouts.
- Even with `width="full"`, preserve right-edge margin.
- SSH/terminal renderer differences are expected; use conservative glyphs.
- In non-interactive or CI logs, prefer snapshot-like output + concise text over frequent redraw.
- Unicode width is not uniform (full-width/combining/emoji may break alignment); avoid fragile alignment assumptions.


## 5) Hard anti-patterns (do not generate by default)

- Multi-chart “BI-like” dense dashboards in initial proposal
- Many series/segments/labels in one view
- Blinky or high-frequency animation/redraw
- Severity encoded by color alone
- Edge-to-edge packed layouts with no breathing room


## 6) Final preflight checklist

Before outputting code/examples:

- [ ] Clear meaning even without color
- [ ] Readable around ~80 columns
- [ ] Key facts also expressed in text
- [ ] Chart/series/label count is restrained
- [ ] Update cadence is calm and stable
- [ ] Output remains terminal-native and quickly scannable
