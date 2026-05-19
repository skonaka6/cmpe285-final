# AI usage reflection

> Fill in honestly before submission. This file is a template from scaffolding; replace bracketed notes with your own experience.

## What Claude / AI wrote end-to-end

- Initial Express + SQLite API layout, migration-style `db.js`, and seed script structure for 120 items.
- React component scaffolding: `LoginScreen`, `SwipeCard` gesture logic, `SwipeDeck`, `ResultsView`, and API client helpers.
- README structure, requirements checklist, and curl examples.

## Where I pushed back or fixed AI output

**Example:** Early drafts used invalid JSX closing tags (`</motion>` instead of `</motion>`) when generating components. I ran a pass to fix markup and simplified deck indexing so the next card is always `deck[0]` after the parent updates `votedIds`, instead of incrementing an index that could skip cards.

## One thing AI did better / worse than expected

- **Better:** Fast boilerplate for session auth (users + sessions tables, Bearer middleware, upsert votes) matched the assignment’s dedup requirement without over-engineering.
- **Worse:** UI code needed careful review for small syntax mistakes and gesture edge cases; touch vs mouse behavior had to be verified manually on a narrow viewport.

## Other tools

- [List any other tools, e.g. Cursor Agent for terminal fixes, image sources, etc.]
