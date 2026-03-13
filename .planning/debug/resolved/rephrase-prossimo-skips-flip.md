---
status: resolved
trigger: "rephrase-prossimo-skips-flip"
created: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:02:00Z
---

## Current Focus

hypothesis: CONFIRMED — inline setTimeout in template fails because Vue resolves it as _ctx.setTimeout (undefined)
test: Checkpoint response confirmed TypeError: _ctx.setTimeout is not a function
expecting: Moving setTimeout logic into a named script-setup function `handleNext` and using @click="handleNext" in template will resolve both errors
next_action: human verification — confirm Prossimo animates flip-to-front before advancing

## Symptoms

expected: Clicking "Prossimo" should flip the card to show the front (card-front) before advancing to the next item
actual: Clicking "Prossimo" immediately advances to the next card without flipping to front first
errors: None reported
reproduction: On the Rephrase page, flip a card to the back, then click the "Prossimo" button
started: Unknown

## Eliminated

- hypothesis: inline arrow function with setTimeout works in Vue template
  evidence: Vue resolves all identifiers in templates against the component instance (_ctx); setTimeout is not exposed there, causing TypeError: _ctx.setTimeout is not a function at runtime
  timestamp: 2026-03-13T00:02:00Z

## Evidence

- timestamp: 2026-03-13T00:00:00Z
  checked: app/pages/rephrase/[deck].vue lines 308-323 (Prossimo button + controls block)
  found: |
    The Prossimo button is rendered when `selectedChoice === null` and has:
      @click="handleAnswer(true)"
    handleAnswer() immediately sets flipped.value = false AND increments index.value in the same synchronous call.
    There is no intermediate step that first animates the card back to the front face before advancing.
  implication: The card flips from back to front and the index changes simultaneously — visually the card just jumps to the next front face instantly. The flip-back animation is never observed.

## Resolution

root_cause: |
  In app/pages/rephrase/[deck].vue, the "Prossimo" button (@click="handleAnswer(true)") calls handleAnswer()
  directly, which sets flipped=false and advances the index in the same tick. There is no two-step
  sequence: flip-to-front first, then (after animation completes) advance the index.

  The intended UX is: click Prossimo → card flips to front → after CSS transition (~600ms) → index advances.
  The actual UX is: click Prossimo → both flipped=false and index++ happen immediately.

fix: |
  Added handleNext() function to <script setup>:
    function handleNext() {
      flipped.value = false
      setTimeout(() => handleAnswer(true), 700)
    }

  Updated Prossimo button in template from inline arrow to @click="handleNext".

  Step 1: flipped.value = false triggers the CSS flip-to-front animation (0.7s cubic-bezier on .card)
  Step 2: After 700ms, handleAnswer(true) updates SRS and advances the index

  The previous attempt used an inline arrow with setTimeout which failed because Vue templates
  resolve all identifiers against the component instance — window.setTimeout is not exposed there.

verification: confirmed by user — Prossimo now animates flip-to-front before advancing to next card
files_changed:
  - app/pages/rephrase/[deck].vue
files_changed:
  - app/pages/rephrase/[deck].vue
