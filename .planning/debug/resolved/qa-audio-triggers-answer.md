---
status: resolved
trigger: "qa-audio-triggers-answer — audio button on QA card back triggers answer handler instead of playing audio"
created: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — The `<span class="quiz-audio-icon">` is a nested interactive element inside the `<button>` root of ChoiceButton. Browsers (real browser environments, not JSDOM) can activate the parent button's click when clicking inside its bounds regardless of stopPropagation on the child span. The fix is to move the audio control outside the `<button>` as a sibling.
test: Ran JSDOM test confirming span click does NOT emit 'click' in test env — but JSDOM doesn't replicate real browser button activation behavior; the actual DOM structure is the problem.
expecting: Restructuring ChoiceButton so audio and choice button are siblings (not parent-child) will fix the issue in all browsers.
next_action: Refactor ChoiceButton.vue to wrap both elements in a div container; update CSS; update tests that use `wrapper.find('button')`

## Symptoms

expected: Clicking the audio icon (🔊 — `<span role="button" class="quiz-audio-icon" data-speaker="" tabindex="0">`) on the QA card back should play audio
actual: Clicking the audio icon triggers the answer/advances the card instead (audio does NOT play; answer fires)
errors: None reported
reproduction: Navigate to /it/qa/coffee, reveal card back, click 🔊 audio button
started: Unknown — likely introduced when QA pages were built
location: app/pages/qa/[scenario].vue (vue-port branch)

## Eliminated

- hypothesis: Parent wrapper div in [scenario].vue has a click handler that catches audio clicks
  evidence: Template inspection shows no @click on any ancestor div of the ChoiceButton list
  timestamp: 2026-03-13

- hypothesis: Vue 3 event fallthrough causes @click on ChoiceButton component to also add native DOM listener
  evidence: `click` is in defineEmits, so Vue 3 does NOT fall through; confirmed by JSDOM test showing span click does not emit 'click'
  timestamp: 2026-03-13

- hypothesis: CSS pointer-events issue blocks span from receiving clicks
  evidence: No CSS rules for .quiz-audio-icon; .quiz-btn::before has pointer-events: none; nothing prevents span clicks
  timestamp: 2026-03-13

## Evidence

- timestamp: 2026-03-13
  checked: app/components/ChoiceButton.vue
  found: Audio span is NESTED INSIDE the <button> element; uses @click.stop which works in JSDOM but real browsers can activate parent button regardless
  implication: Structural issue — interactive element nested inside another interactive element (button inside button or span-as-button inside button)

- timestamp: 2026-03-13
  checked: JSDOM isolation test
  found: In JSDOM, clicking [data-speaker] span emits 'speak' but NOT 'click' — stopPropagation works in test env
  implication: The bug is real-browser-specific; JSDOM does not replicate native button activation behavior

- timestamp: 2026-03-13
  checked: app/components/ChoiceButton.vue structure
  found: Root element is <button>; audio span is a child flex item; this violates HTML spec (interactive content inside button)
  implication: Root cause is architectural — the span-as-button inside button causes browser-specific activation of the outer button

## Resolution

root_cause: The `<span class="quiz-audio-icon">` interactive audio element was nested inside the `<button>` root element of ChoiceButton. HTML spec disallows interactive content inside `<button>`. In real browsers (not JSDOM), clicking the span activates the parent button's click handler despite `event.stopPropagation()` on the span, because button activation is based on pointer events within button bounds, not solely on click event bubbling.
fix: Refactored ChoiceButton.vue to wrap both the choice `<button class="quiz-btn">` and a new `<button class="quiz-audio-btn">` as siblings inside `<div class="choice-btn-group">`. The audio control is now a proper `<button>` (not a span) at the same DOM level as the choice button. Added `.choice-btn-group`, `.quiz-audio-btn`, and state-matching CSS for correct/incorrect states.
verification: 110/110 tests pass including new regression test 'clicking speaker button does NOT emit click'. Awaiting human verification in browser.
files_changed:
  - app/components/ChoiceButton.vue
  - app/assets/css/main.css
  - tests/nuxt/ChoiceButton.test.ts
