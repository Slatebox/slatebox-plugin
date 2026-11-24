---
name: plan-project
description: Plan a project as a Gantt chart on a Slatebox slate, with phases, tasks, dates and dependencies, and return the slate link. Use when someone asks for a project plan, a timeline, a schedule, a roadmap or a Gantt chart.
---

# Plan a project as a Gantt chart

Slatebox draws a Mermaid Gantt chart as a plan on a slate: each section becomes a frame and each task a note on the timeline.

## Steps

1. Collect what you need. Ask only for what is missing and matters:
   - the goal and the finish date or length (for example "six weeks");
   - the start date (default: next Monday; say which date you used);
   - the main phases, people or constraints if the person mentioned them.
2. Draft the plan: 2 to 6 sections (phases), 2 to 6 tasks in each. Give every task a length, and use `after <id>` where one task must wait for another.
3. Write it as Mermaid `gantt`:

   ```mermaid
   gantt
     title Hiring plan: two engineers
     dateFormat YYYY-MM-DD
     section Prepare
       Write job description :a1, 2026-12-07, 3d
       Post the role         :a2, after a1, 2d
     section Interview
       Screen candidates     :b1, after a2, 7d
       Onsite interviews     :b2, after b1, 7d
     section Close
       Make offers           :c1, after b2, 3d
       Onboarding prep       :c2, after c1, 5d
   ```

   - Every task needs an id (`a1`) so others can depend on it.
   - Use `d` for days and `w` for weeks.
   - Mark fixed dates with `milestone` if the person names them (for example a launch day).
4. Call `import_mermaid` with `mermaid` and a short `name` such as "Hiring plan". Leave out `shareId` for a new slate, or pass one to add the plan beside what that slate holds.
5. On `400 mermaid_invalid`, fix the named line and call once more. On `confirmation_required`, show the person the reasons and repeat with `confirm` and the same `idempotencyKey` only if they agree.

## Finish

Give a short summary: the number of phases, the start and end dates, and the critical path in one line. End with the slate link from the result, for example `https://app.slatebox.com/canvas/<shareId>`. Mention that people can drag tasks on the slate to change dates.

To read a plan back later, call `export_mermaid` with the slate's `shareId` and `format: "gantt"`.
