---
status: complete
phase: 16-bug-fixes
source: 16-01-SUMMARY.md, 16-02-SUMMARY.md
started: 2026-03-09T12:00:00Z
updated: 2026-03-09T12:10:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. DeckGrid Shows Live Due Count Badge
expected: Open the home page (deck list). Each deck card shows a badge with the number of cards currently due for that deck — this should reflect your actual SRS state, not a static total card count. For a new user (no progress saved), all cards should be shown as due, so the badge count should equal the full card count for each deck.
result: pass

### 2. DeckGrid Badge Shows Checkmark When 0 Due
expected: After completing a study session and having 0 cards due in a deck, navigate back to the home page. The badge for that deck should show ✓ (Unicode checkmark) instead of a number.
result: pass

### 3. Badge Reacts to Level Filter
expected: On the home page, toggle the level filter (e.g., switch from A1+A2 to A1 only). The due-count badges on deck cards should update to reflect only the cards matching the active level filter.
result: issue
reported: "not seeing any change in due counts"
severity: major

### 4. No Premature All-Done Screen During Study
expected: Start a study session. Answer all cards in one deck. If you have other decks with cards still due (in the same language), the all-done/completion screen should NOT appear — you should be able to continue studying the remaining decks. The premature "all done" bug (where finishing one deck triggered the completion screen even when other decks had due cards) should be fixed.
result: pass

### 5. Language Scope: A1-Only Users No Premature All-Done
expected: If you are an A1-only user (level filter set to A1) studying Italian or Spanish, after answering all A1 cards in one deck, the all-done screen should only appear when ALL A1 cards across ALL decks in your language are complete — not when one deck is done. (This checks that the fix correctly scopes to your current language and active level.)
result: skipped
reason: Partial confirmation - finished one deck without seeing all-done screen; completing all decks to fully verify would take too long

## Summary

total: 5
passed: 3
issues: 1
pending: 0
skipped: 1

## Gaps

- truth: "Toggling the level filter updates the due-count badge on each deck card"
  status: failed
  reason: "User reported: not seeing any change in due counts"
  severity: major
  test: 3
  artifacts: []
  missing: []
