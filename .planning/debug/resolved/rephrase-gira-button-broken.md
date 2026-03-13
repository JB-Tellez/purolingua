---
status: resolved
trigger: "Gira button on card back does nothing when clicked / no flip animation"
created: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:02:00Z
---

## Current Focus

hypothesis: CONFIRMED AND FIXED — Template was missing the inner .card element. The CSS 3D flip animation requires: .card-container (perspective) > .card (transform-style: preserve-3d + transition, carries .flipped) > .card-face elements (backface-visibility: hidden). The template had .card-container carrying .flipped but the CSS rule that animates is .card.flipped — so the transition never fired. Both fixes applied: (1) wrapped faces in .card, moved .flipped there, (2) added transform: rotateY(180deg) to .card-back CSS so it starts facing away.

test: Template restructured, CSS updated
expecting: 0.7s cubic-bezier 3D flip animation visible when clicking card or Gira button
next_action: human verification

## Symptoms

expected: Clicking "Gira" on the card back should flip the card back to the front face (set flipped = false)
actual: Clicking "Gira" does nothing — card stays on the back face
errors: No JS errors — broken event propagation
reproduction: Start Rephrase session, flip card to back, click Gira button
started: Vue port regression

## Eliminated

- hypothesis: Missing @click binding on Gira button
  evidence: @click="flipped = false" IS present at line 311
  timestamp: 2026-03-13

- hypothesis: flipped.value not a reactive ref
  evidence: flipped = ref(false) at line 30, properly reactive
  timestamp: 2026-03-13

## Evidence

- timestamp: 2026-03-13T00:00
  checked: app/pages/rephrase/[deck].vue full template
  found: card-container has @click="() => { if (!flipped) flipped = true }" at line 265. Gira button has @click="flipped = false" at line 311 with NO .stop modifier.
  implication: When Gira is clicked: (1) flipped set to false, (2) event bubbles to card-container, (3) container checks !flipped which is now true (false === false is true), (4) sets flipped back to true. Net effect: no change. Root cause of original bug.

- timestamp: 2026-03-13T00:01
  checked: app/assets/css/main.css lines 398-474 + template structure
  found: CSS defines animation on .card { transform-style: preserve-3d; transition: transform 0.7s } and .card.flipped { transform: rotateY(180deg) }. Template had .card-container carrying :class="{ flipped }" but NO inner .card div. Faces were toggled with v-if/v-else (DOM swap), not both present in DOM. .card-back also missing transform: rotateY(180deg).
  implication: CSS animation rule .card.flipped never matched — .card-container.flipped is not the same element. The v-if/v-else produced instant DOM swap instead of 3D transition. This is the root cause of the no-animation regression.

## Resolution

root_cause: Two bugs. (1) Gira button click event bubbled to card-container which re-set flipped=true immediately — fixed by @click.stop. (2) No inner .card wrapper element in template — the CSS 3D flip animation targets .card.flipped { transform: rotateY(180deg) } but .flipped was on .card-container; plus v-if/v-else swapped DOM instead of keeping both faces present for backface-visibility to work.
fix: (1) Added @click.stop to Gira button. (2) Wrapped card faces in inner <div class="card" :class="{ flipped }"> element, removed :class="{ flipped }" from .card-container, changed v-if/v-else to static always-present divs (CSS visibility rules handle hiding/showing). (3) Added transform: rotateY(180deg) to .card-back CSS.
verification: Fix applied. CSS face-hiding rules (.card:not(.flipped) .card-back and .card.flipped .card-front with pointer-events:none + visibility:hidden) correctly prevent interaction with the hidden face.
files_changed:
  - app/pages/rephrase/[deck].vue
  - app/assets/css/main.css
