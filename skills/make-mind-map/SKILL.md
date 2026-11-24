---
name: make-mind-map
description: Draw a mind map on a new Slatebox slate from a topic, a list of ideas or notes the person gives you, and return the slate link. Use when someone asks for a mind map, a brainstorm map, an idea map or a topic breakdown they can edit with their team.
---

# Make a mind map

Slatebox draws a Mermaid mind map as real notes and lines on a slate that people can open and edit together.

## Steps

1. Work out the centre topic and the branches.
   - If the person gave ideas or notes, use their words. Group them into 3 to 7 main branches.
   - If they gave only a topic, draft the branches yourself: 3 to 7 main branches, 2 to 5 ideas under each.
   - Keep each note short: a few words, not sentences.
2. Write the mind map in Mermaid `mindmap` syntax. One root, indented children:

   ```mermaid
   mindmap
     root((Team offsite))
       Goals
         Plan next quarter
         Meet the new hires
       Activities
         Workshop
         Dinner
       Logistics
         Venue
         Travel
   ```

   - Use plain text for each node. Wrap text that holds brackets or parentheses in double quotes.
   - Use only the root shape `((...))`. Leave the other nodes as plain text.
3. Call `import_mermaid` with:
   - `mermaid`: the Mermaid text.
   - `name`: a short slate name, such as "Team offsite ideas".
   - Leave out `shareId` to make a new slate. To add the map beside what an existing slate holds, pass that slate's `shareId` (the part after `/canvas/` in its link).
4. If the call answers `400 mermaid_invalid`, fix the line it names and call again once. If it answers `422 mermaid_too_large`, split the map into two smaller maps.
5. If the call answers `confirmation_required`, show the person the reasons. Repeat the call with `confirm` and the same `idempotencyKey` only if they agree.

## Finish

Tell the person what you drew in one or two sentences (the root and the main branches). End with the slate link from the result, for example `https://app.slatebox.com/canvas/<shareId>`, and say that anyone they share it with can edit the map live.
