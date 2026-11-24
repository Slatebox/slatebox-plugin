---
name: present-slate
description: Turn a Slatebox slate into a presentation that plays on the live canvas, or change the style of an existing one, and return the link that plays it. Use when someone wants to present a slate, make slides or a deck from a slate, or restyle a slate's presentation.
---

# Turn a slate into a presentation

A Slatebox presentation plays on the live canvas: the camera moves from note to note, each step with a layout (title, overview, dive, hero, compare, quote and others), a kicker and a caption. `create_presentation` builds one with the same planner as the Present button in Slatebox.

## Steps

1. Find the slate's `shareId` (the part after `/canvas/` in its link). If the person has no slate yet, draw one first with the mind map, flowchart or project plan skill.
2. Choose a style, or let Slatebox choose:
   - `voyage`, `stage`, `editorial`, `neon`, `sketch`, `blueprint`, `journey` or `calm`.
   - If the person has no preference, pick one that fits the content: `editorial` or `calm` for reports, `stage` or `neon` for launches, `blueprint` for technical designs, `journey` for timelines and plans, `sketch` for workshops. Or leave `style` out and Slatebox chooses.
   - A `palette` of 3 to 6 colours such as `["#1d2026", "#fbcc88", "#4f7cff"]` goes with a style.
3. Call `create_presentation` with the `shareId`, the optional `style` and `palette`, and an optional `brief` in the person's words (what to focus on, for example "the risks and the budget"). It uses AI, counted like the Present button, and saves a new version each time, so call it once per request.
4. If the slate is empty, or the answer says `automatic: true`, tell the person what `reason` says. An empty slate needs notes first; an automatic presentation still plays, grouped by Slatebox instead of planned by the AI.
5. To change only the style of the presentation that was just made, call `style_presentation` with the `shareId` and the new `style` (and optional `palette`). It keeps the same steps and uses no AI. `get_presentation` reads the latest presentation again.
6. On `confirmation_required`, show the reasons and repeat with `confirm` and the same `idempotencyKey` only if they agree.

## Finish

Say which style the presentation uses and list its steps (layout and caption). End with the `link` from `create_presentation`, which opens the slate and plays the presentation, for example `https://app.slatebox.com/canvas/<shareId>?present=1`.
