---
name: present-slate
description: Turn a Slatebox slate into a presentation that plays on the live canvas, or change the style of an existing one, and return the slate link. Use when someone wants to present a slate, make slides or a deck from a slate, or restyle a slate's presentation.
---

# Turn a slate into a presentation

A Slatebox presentation plays on the live canvas: the camera moves from note to note, each step with a layout (title, overview, dive, hero, compare, quote and others) and a caption.

## Steps

1. Find the slate's `shareId` (the part after `/canvas/` in its link). If the person has no slate yet, draw one first with the mind map, flowchart or project plan skill.
2. Call `get_presentation` with the `shareId`.
3. **If a presentation exists**, tell the person its style and list its steps (layout and caption). Then offer a style:
   - `voyage`, `stage`, `editorial`, `neon`, `sketch`, `blueprint`, `journey` or `calm`.
   - Pick one that fits the content if the person has no preference: `editorial` or `calm` for reports, `stage` or `neon` for launches, `blueprint` for technical designs, `journey` for timelines and plans, `sketch` for workshops.
   - Call `style_presentation` with the `shareId`, the `style`, and an optional `palette` of 3 to 6 colours such as `["#1d2026", "#fbcc88", "#4f7cff"]`. This keeps the same steps in the same order.
4. **If there is no presentation yet**, get the slate ready and hand off:
   - Call `get_slate` and check that the slate reads well as a story: a clear title note, short note texts, and groups in a sensible order.
   - Offer fixes and, if the person agrees, make them with `edit_slate` (pass the `revision` from `get_slate` as `expectedRevision`; use `mode: "preview"` first).
   - Then tell the person to open the slate and start a presentation from it in Slatebox. Slatebox builds the steps and captions. Once it exists, you can restyle it with `style_presentation`.
5. On `confirmation_required`, show the reasons and repeat with `confirm` and the same `idempotencyKey` only if they agree.

## Finish

Say which style the presentation uses and how many steps it has. End with the slate link, for example `https://app.slatebox.com/canvas/<shareId>`.
