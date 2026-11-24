---
name: add-smart-board
description: Add a smart board, such as a sales pipeline, hiring plan, launch plan, budget or release plan, to a new or existing Slatebox slate, fill it with cards, and return the slate link. Use when someone wants a board with lanes and cards that follows rules, not a static diagram.
---

# Add a smart board

A smart board is a board on a slate with lanes, cards and rules (for example "a candidate cannot skip the interview lane"). Slatebox keeps the rules when people drag cards. A slate holds up to 8 boards side by side.

## Steps

1. Find the slate.
   - If the person gave a slate link, its `shareId` is the part after `/canvas/`.
   - If not, make a slate first: call `create_slate` with `kind: "diagram"` and a one-line `brief` naming the board, for example `Hiring plan`. Use the `shareId` it returns.
2. Pick the board. Call `list_components` with the `shareId`. It lists every board and starter, what each is for, and whether it fits the slate. Choose the entry that matches the request (pipeline, hiring plan, launch plan, budget, release plan and others). If two fit, ask the person which one.
   - To see the exact phrases and edits an entry takes, call `get_component` with its `id`.
3. Read the slate. Call `get_slate` with the `shareId` and keep its `revision`.
4. Add the board. Call `edit_slate` with:
   - `shareId`;
   - `plan`: one `add_component` operation naming the library entry, with the slate `revision` as its `expectedRevision`;
   - `userMessage`: what the person asked for, in their words.
   If you are unsure of the plan's exact shape, call `describe` with `methods: ["slates.applyOperations"]` first.
   The result names the new board's `boardId`.
5. Fill the board if the person gave items (deals, candidates, tasks). Call `get_slate` again for the board's `workshop.revision`, then call `edit_slate` with a `workshop_edits` plan naming the `boardId` (1 to 50 edits: add cards to lanes, rename lanes). Send `mode: "preview"` first when you add more than 10 cards, and show the person what will change.
6. Before moving a card for the person, you can call `check_board_move` with the `shareId`, `boardId`, `card` and `lane` to see whether the rules allow it and why not.
7. If a call answers `409 edit_refused` or `409 move_refused`, tell the person the sentence it returns; that is the rule speaking. On `confirmation_required`, show the reasons and repeat with `confirm` and the same `idempotencyKey` only if they agree.

## Finish

Say which board you added, its lanes, and how many cards you put on it. End with the slate link, for example `https://app.slatebox.com/canvas/<shareId>`.
