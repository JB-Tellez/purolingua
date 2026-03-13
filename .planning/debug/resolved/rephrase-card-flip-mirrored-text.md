---
status: resolved
trigger: "After flipping a card in the Rephrase activity, all answer text is rendered mirrored/horizontally reversed."
created: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:00:00Z
---

## Current Focus

hypothesis: The card-back face has `transform: rotateY(180deg)` in CSS to pre-rotate it for the 3D flip, but the Vue template uses `v-if="!flipped"` / `v-else` to conditionally render faces rather than keeping both faces always present in the DOM. This means the CSS pre-rotation on `.card-back` is applied to an element that is conditionally mounted when `flipped=true` — but at that point, the parent `.card-container` is NOT rotated (no `.flipped` class on it), so the back face shows with its `rotateY(180deg)` applied in isolation, mirroring all content.
test: Confirmed by reading template: `.card-container` receives `:class="{ flipped }"` but the CSS `.card.flipped` rule rotates `.card` not `.card-container`. Also the CSS `.card-back` has `transform: rotateY(180deg) translateZ(0)` but the parent never rotates to compensate.
expecting: Fix requires changing the implementation to use the standard 3D flip pattern: always render both faces, rotate the shared `.card` wrapper on flip, rely on `backface-visibility: hidden` on each face — OR remove the CSS `rotateY(180deg)` from `.card-back` since the Vue template already handles visibility via `v-if/v-else`.
next_action: Apply fix — remove `transform: rotateY(180deg)` from `.card-back` CSS (and its webkit prefixed version) since the Vue template's v-if/v-else already manages which face is shown, making the CSS pre-rotation counterproductive and causing the mirror effect.

## Symptoms

expected: After flipping a card in the Rephrase activity, answer options should display normal readable text
actual: All text on the card back (answer options) appears horizontally mirrored — letters and words are reversed left-to-right
errors: No JS errors — purely visual/CSS
reproduction: Visit the Rephrase study session page, flip a card, observe the answer options list
started: Likely introduced during the Vue port (vue-port branch)

## Eliminated

- hypothesis: Bug is in a child component (ChoiceButton, MicButton, etc.)
  evidence: The mirroring is a CSS transform on the container, not text-direction in child components
  timestamp: 2026-03-13T00:00:00Z

## Evidence

- timestamp: 2026-03-13T00:00:00Z
  checked: app/assets/css/main.css lines 517-527
  found: `.card-back` has `-webkit-transform: rotateY(180deg) translateZ(0)` and `transform: rotateY(180deg) translateZ(0)` — this pre-rotates the back face 180deg on Y-axis
  implication: In a standard 3D flip, this counter-rotation is needed because the parent `.card` also rotates 180deg on flip, canceling it out so the back face reads correctly. But this requires BOTH faces to always be in the DOM.

- timestamp: 2026-03-13T00:00:00Z
  checked: app/pages/rephrase/[deck].vue lines 262-324
  found: Template uses `v-if="!flipped"` on `.card-front` and `v-else` on `.card-back`. The parent is `.card-container` (not `.card`). The `.card-container` gets `:class="{ flipped }"` but CSS `.card.flipped` rule targets `.card`, not `.card-container`.
  implication: Two problems compound: (1) v-if/v-else means only one face exists in DOM at a time — the standard 3D flip pattern requires both faces always present so `backface-visibility: hidden` can hide the back while showing the front. (2) When `flipped=true`, `.card-back` is mounted fresh with `rotateY(180deg)` applied but its parent has NO compensating rotation, so the 180deg rotation stands alone and mirrors all content.

- timestamp: 2026-03-13T00:00:00Z
  checked: CSS `.card.flipped` rule (line 416-418)
  found: `.card.flipped { transform: rotateY(180deg); }` — this targets `.card` class but the Vue template renders `.card-container` as the flip wrapper, not an element with class `card`.
  implication: The parent container rotation never fires even if both faces were in the DOM. The CSS flip infrastructure is entirely disconnected from the Vue template structure.

## Resolution

root_cause: The CSS card flip system expects a `.card` wrapper element (that rotates on `.card.flipped`) with two always-present child `.card-face` elements (`.card-front` and `.card-back`, where `.card-back` has a pre-applied `rotateY(180deg)` counter-rotation). The Vue template instead uses `.card-container` as the wrapper (so `.card.flipped` CSS rule never triggers) and `v-if/v-else` to toggle between faces (so both faces are never in DOM simultaneously). When `flipped=true`, `.card-back` is mounted with `rotateY(180deg)` but no parent rotation compensates, resulting in mirrored content.

fix: Removed `-webkit-transform: rotateY(180deg) translateZ(0)` and `transform: rotateY(180deg) translateZ(0)` from the `.card-back` CSS rule in main.css. The Vue template's v-if/v-else already handles showing only the correct face — the CSS pre-rotation is not needed and is the sole cause of the mirror effect.

verification: confirmed fixed by human — card back text reads correctly after flip
files_changed:
  - app/assets/css/main.css
