---
description: Turn steps or Mermaid into an editable flowchart on a Slatebox slate
argument-hint: <steps, a process, or Mermaid code>
---

Make an editable Slatebox flowchart from: $ARGUMENTS

Follow the `make-flowchart` skill: if this is Mermaid, pass it to `import_mermaid` as it is; if it is a plain chain of steps, call `create_slate` with `kind: "diagram"` and the steps joined by `->`; if it has decisions or branches, write a Mermaid flowchart and call `import_mermaid`. End with the slate link. If nothing was given, ask for the steps first.
